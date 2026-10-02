// Seed mock obras sociales data for testing.
// Usage: node scripts/seed-obras-sociales.mjs
//
// Creates:
//   insurance_providers  — 4 obras sociales
//   pricing_agreements   — 1 acuerdo vigente por obra social (con ~10 prácticas cada uno)
//   user_providers       — vincula uid "dev-user" a las 4 obras sociales

const PROJECT_ID = 'system-doctors';
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

// ─── helpers ────────────────────────────────────────────────────────────────

function toFs(obj) {
  const fields = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === null || v === undefined) continue;
    if (typeof v === 'string')  fields[k] = { stringValue: v };
    else if (typeof v === 'number') fields[k] = { doubleValue: v };
    else if (typeof v === 'boolean') fields[k] = { booleanValue: v };
    else if (Array.isArray(v)) {
      fields[k] = {
        arrayValue: {
          values: v.map((item) =>
            typeof item === 'object' ? { mapValue: { fields: toFs(item) } } : { stringValue: String(item) }
          ),
        },
      };
    } else if (typeof v === 'object') {
      fields[k] = { mapValue: { fields: toFs(v) } };
    }
  }
  return fields;
}

async function addDoc(col, data) {
  const res = await fetch(`${BASE}/${col}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: toFs(data) }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`POST /${col} failed: ${err}`);
  }
  const json = await res.json();
  return json.name.split('/').pop(); // document id
}

// ─── data ────────────────────────────────────────────────────────────────────

const NOW = new Date().toISOString();
const DESDE = '2025-01-01';

const PROVIDERS = [
  { nombre: 'IOSCOR',  codigoObraSocial: '500001', activa: true, creadoEn: NOW },
  { nombre: 'PAMI',    codigoObraSocial: '500002', activa: true, creadoEn: NOW },
  { nombre: 'OSDE',    codigoObraSocial: '500003', activa: true, creadoEn: NOW },
  { nombre: 'Swiss Medical', codigoObraSocial: '500004', activa: true, creadoEn: NOW },
];

function makeAgreement(providerId, providerNombre) {
  return {
    providerId,
    vigenciaDesde: DESDE,
    descripcion: `Acuerdo arancelario vigente ${providerNombre} – Corrientes 2025`,
    creadoEn: NOW,
    items: [
      { codigo: '01.01', descripcion: 'Consulta médica ambulatoria',           precio: 12500,  unidad: 'consulta' },
      { codigo: '01.02', descripcion: 'Consulta de urgencia',                   precio: 18000,  unidad: 'consulta' },
      { codigo: '02.01', descripcion: 'Electrocardiograma (ECG)',               precio: 8500,   unidad: 'estudio'  },
      { codigo: '02.02', descripcion: 'Ecografía abdominal',                    precio: 22000,  unidad: 'estudio'  },
      { codigo: '02.03', descripcion: 'Radiografía de tórax F/P',               precio: 9800,   unidad: 'estudio'  },
      { codigo: '03.01', descripcion: 'Hemograma completo',                     precio: 4200,   unidad: 'análisis' },
      { codigo: '03.02', descripcion: 'Glucemia en ayunas',                     precio: 2100,   unidad: 'análisis' },
      { codigo: '03.03', descripcion: 'Perfil lipídico completo',               precio: 5600,   unidad: 'análisis' },
      { codigo: '04.01', descripcion: 'Infiltración articular',                 precio: 15000,  unidad: 'práctica' },
      { codigo: '04.02', descripcion: 'Extracción de puntos / curaciones',      precio: 6500,   unidad: 'práctica' },
      { codigo: '05.01', descripcion: 'Nebulización',                           precio: 4800,   unidad: 'práctica' },
      { codigo: '05.02', descripcion: 'Inyectable IM/IV',                       precio: 3200,   unidad: 'práctica' },
    ],
  };
}

// ─── main ────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('Creando obras sociales...');
  const providerIds = [];

  for (const p of PROVIDERS) {
    const id = await addDoc('insurance_providers', p);
    providerIds.push(id);
    console.log(`  ✓ ${p.nombre} → ${id}`);
  }

  console.log('\nCreando acuerdos arancelarios...');
  for (let i = 0; i < providerIds.length; i++) {
    const agreement = makeAgreement(providerIds[i], PROVIDERS[i].nombre);
    const id = await addDoc('pricing_agreements', agreement);
    console.log(`  ✓ Acuerdo ${PROVIDERS[i].nombre} → ${id}`);
  }

  console.log('\nVinculando obras sociales al usuario dev-user...');
  for (let i = 0; i < providerIds.length; i++) {
    const id = await addDoc('user_providers', {
      uid: 'dev-user',
      providerId: providerIds[i],
      creadoEn: NOW,
    });
    console.log(`  ✓ user_providers → ${id}`);
  }

  console.log('\nDone. 4 obras sociales listas para testear.');
}

seed().catch((e) => { console.error(e); process.exit(1); });
