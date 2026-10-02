// Run once to create the initial users in Firebase Auth + Firestore.
// Usage (las contraseñas nunca van en el repo):
//   SEED_ADMIN_PASSWORD=... SEED_DOCTOR_PASSWORD=... node --env-file=.env.local scripts/seed-users.mjs

const API_KEY    = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const { SEED_ADMIN_PASSWORD, SEED_DOCTOR_PASSWORD } = process.env;

if (!API_KEY || !PROJECT_ID || !SEED_ADMIN_PASSWORD || !SEED_DOCTOR_PASSWORD) {
  console.error('Faltan variables: NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_PROJECT_ID, SEED_ADMIN_PASSWORD, SEED_DOCTOR_PASSWORD');
  process.exit(1);
}

const USERS = [
  {
    email:    'admin@medisystem.com',
    password: SEED_ADMIN_PASSWORD,
    nombre:   'Super Admin',
    rol:      'super_admin',
    cuentaId: 'sistema',
  },
  {
    email:    'doctor@medisystem.com',
    password: SEED_DOCTOR_PASSWORD,
    nombre:   'Dr. Demo',
    rol:      'medico',
    cuentaId: 'consultorio_demo',
  },
];

async function crearOObtenerAuth(email, password) {
  let res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    }
  );
  let data = await res.json();

  if (!res.ok) {
    if (data.error?.message === 'EMAIL_EXISTS') {
      res = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, returnSecureToken: true }),
        }
      );
      data = await res.json();
      if (!res.ok) throw new Error(data.error?.message ?? 'Sign-in error');
    } else {
      throw new Error(data.error?.message ?? 'Auth error');
    }
  }

  return { uid: data.localId, idToken: data.idToken };
}

async function crearPerfilFirestore(uid, idToken, perfil) {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/usuarios/${uid}`;
  const fields = {
    uid:      { stringValue: uid },
    nombre:   { stringValue: perfil.nombre },
    email:    { stringValue: perfil.email },
    rol:      { stringValue: perfil.rol },
    cuentaId: { stringValue: perfil.cuentaId },
    activo:   { booleanValue: true },
    creadoEn: { stringValue: new Date().toISOString() },
  };

  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`,
    },
    body: JSON.stringify({ fields }),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error?.message ?? 'Firestore error');
  }
}

async function main() {
  console.log('🌱 Creando usuarios en Firebase...\n');

  const pendingFirestore = [];

  for (const user of USERS) {
    process.stdout.write(`→ ${user.email} (${user.rol})... `);
    try {
      const { uid, idToken } = await crearOObtenerAuth(user.email, user.password);

      try {
        await crearPerfilFirestore(uid, idToken, user);
        console.log(`✅  UID: ${uid}`);
      } catch {
        console.log(`⚠️   Auth OK (UID: ${uid}) — Firestore bloqueado por reglas`);
        pendingFirestore.push({ ...user, uid });
      }
    } catch (e) {
      console.log(`❌  Error: ${e.message}`);
    }
  }

  if (pendingFirestore.length > 0) {
    console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  Los usuarios de Auth fueron creados pero los perfiles
    de Firestore no se pudieron escribir por las reglas.

SOLUCIÓN — Pegá esto en Firebase Console → Firestore Rules
y guardá TEMPORALMENTE:

  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /{document=**} {
        allow read, write: if true;
      }
    }
  }

Luego volvé a correr: node scripts/seed-users.mjs

Después restaurá tus reglas de producción.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

O creá los documentos manualmente en:
Firebase Console → Firestore → usuarios → (New document)

`);
    for (const u of pendingFirestore) {
      console.log(`  Colección: usuarios`);
      console.log(`  ID del documento: ${u.uid}\n`);
      console.log(JSON.stringify({
        uid:      u.uid,
        nombre:   u.nombre,
        email:    u.email,
        rol:      u.rol,
        cuentaId: u.cuentaId,
        activo:   true,
        creadoEn: new Date().toISOString(),
      }, null, 4));
      console.log('');
    }
  }

  console.log('─────────────────────────────────────────');
  console.log('Credenciales para iniciar sesión:\n');
  for (const u of USERS) {
    console.log(`  ${u.rol.padEnd(12)}  ${u.email}  /  ${u.password}`);
  }
  console.log('─────────────────────────────────────────\n');
}

main();
