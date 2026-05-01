# MediSystem

Sistema de gestión para consultorios médicos. Administración de pacientes, turnos, presupuestos, documentos clínicos, stock e integración con WhatsApp.

## Stack técnico

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16 (App Router) |
| Lenguaje | TypeScript |
| UI | Material UI v9 + Tailwind CSS v4 |
| Base de datos | Firebase Firestore |
| Autenticación | Firebase Auth |
| Almacenamiento | Firebase Storage |
| Package manager | pnpm |
| Runtime | Node.js |

## Estructura principal

```
src/
├── app/          # Rutas (Next.js App Router)
│   ├── api/      # API routes (backend)
│   └── */        # Páginas por sección
├── components/   # Componentes reutilizables
├── hooks/        # Data fetching hooks
├── lib/
│   ├── firebase.ts
│   ├── firestore/  # Operaciones por colección
│   └── types/      # Interfaces TypeScript
└── contexts/     # AuthContext
```

## Desarrollo

```bash
pnpm install
pnpm dev
```

La app corre en `http://localhost:3000`. En modo desarrollo la autenticación está deshabilitada y usa un usuario mock.

## Secciones

- **Pacientes** — CRUD + historia clínica
- **Invitaciones** — registro de pacientes vía link externo
- **Turnos** — agenda con vista calendario y lista
- **Obras Sociales** — coberturas y aranceles
- **Documentos** — consentimientos, protocolos, formularios
- **Presupuestos** — generador con prácticas, tratamientos y estudios externos
- **Prácticas** — catálogo de prestaciones con precio
- **Tratamientos** — paquetes de prácticas reutilizables
- **Contenido IA** — generación de texto asistida
- **Mensajes** — bandeja de WhatsApp vía n8n
- **Stock** — inventario con alertas y movimientos
