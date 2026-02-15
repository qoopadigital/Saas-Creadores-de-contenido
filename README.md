<div align="center">

# 🚀 CreatorOS

**Tu sistema operativo para Creadores de Contenido, Marcas y Agencias**

El SaaS que centraliza la gestión de campañas, finanzas, portafolio público y equipos de trabajo en una sola plataforma.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20DB-3FCF8E?logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwindcss)](https://tailwindcss.com/)
[![Shadcn UI](https://img.shields.io/badge/Shadcn_UI-Components-000?logo=shadcnui)](https://ui.shadcn.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://typescriptlang.org/)
[![Recharts](https://img.shields.io/badge/Recharts-Charts-FF6B6B)](https://recharts.org/)

</div>

---

## 📋 Tabla de Contenidos

- [Arquitectura del Proyecto](#-arquitectura-del-proyecto)
- [Base de Datos & Esquema](#-base-de-datos--esquema-supabase)
- [Instalación y Setup Local](#-instalación-y-setup-local)
- [Features Actuales](#-features-actuales-mvp)
- [Guía de Desarrollo](#-guía-de-desarrollo)

---

## 🏗 Arquitectura del Proyecto

### Estructura de Directorios

```
src/
├── app/
│   ├── (auth)/                        # 🔐 Route Group — Autenticación
│   │   ├── actions.ts                 #    Server Actions: login, signup, signOut
│   │   ├── login/page.tsx             #    UI de Login/Registro (toggle)
│   │   └── register/page.tsx          #    Página de registro
│   │
│   ├── (dashboard)/                   # 🏠 Route Group — Área privada
│   │   ├── layout.tsx                 #    Layout protegido (getUser guard + Sidebar)
│   │   └── dashboard/
│   │       ├── actions.ts             #    getDashboardOverview (KPIs reales)
│   │       ├── page.tsx               #    Dashboard home (/dashboard)
│   │       ├── campaigns/
│   │       │   ├── actions.ts         #    getCampaigns, createCampaign, updateCampaignStatus
│   │       │   └── page.tsx           #    Tablero Kanban (/dashboard/campaigns)
│   │       ├── finance/
│   │       │   ├── actions.ts         #    getFinancialData (aggregation)
│   │       │   └── page.tsx           #    Dashboard Financiero (/dashboard/finance)
│   │       └── settings/
│   │           ├── actions.ts         #    getProfile, updateProfile (Zod + unique check)
│   │           └── page.tsx           #    Configuración de Perfil (/dashboard/settings)
│   │
│   ├── (public)/                      # 🌍 Route Group — Páginas públicas
│   │   ├── page.tsx                   #    Landing page (/)
│   │   └── [username]/page.tsx        #    Media Kit público (/mi-usuario)
│   │
│   ├── layout.tsx                     # Root layout (fonts, Toaster global)
│   └── globals.css                    # Tailwind v4 + Shadcn theme variables
│
├── components/
│   ├── ui/                            # 🧱 Shadcn UI primitives
│   │   ├── avatar.tsx                 #    Avatar con fallback de iniciales
│   │   ├── badge.tsx                  #    Badges de estado
│   │   ├── button.tsx                 #    Botones con variantes
│   │   ├── card.tsx                   #    Cards con header/content/footer
│   │   ├── dialog.tsx                 #    Modales
│   │   ├── input.tsx                  #    Inputs de formulario
│   │   ├── label.tsx                  #    Labels accesibles
│   │   ├── sonner.tsx                 #    Toast notifications (Sonner)
│   │   ├── table.tsx                  #    Tablas de datos
│   │   └── textarea.tsx               #    Área de texto (bio)
│   │
│   ├── dashboard/                     # 📊 Componentes del Dashboard
│   │   ├── sidebar.tsx                #    Sidebar responsive (nav + signOut)
│   │   ├── create-campaign-dialog.tsx #    Modal de creación de campaña
│   │   ├── settings-form.tsx          #    Formulario de perfil (avatar preview + bio counter)
│   │   ├── kanban/
│   │   │   ├── board.tsx              #    Tablero DnD (5 columnas, Optimistic UI)
│   │   │   └── card.tsx              #    Tarjeta arrastrable
│   │   └── finance/
│   │       ├── kpi-cards.tsx          #    3 KPIs (Revenue, Pending, Pipeline)
│   │       ├── revenue-chart.tsx      #    AreaChart de ingresos por mes
│   │       └── recent-transactions.tsx #   Tabla de transacciones recientes
│   │
│   ├── auth/                          # 🔑 Componentes de autenticación
│   └── shared/                        # 🔁 Componentes reutilizables
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                  # Cliente browser (@supabase/ssr)
│   │   └── server.ts                  # Cliente server (cookies)
│   └── utils.ts                       # cn() — merge de clases Tailwind
│
└── types/
    ├── database.types.ts              # Enums y tipos TS (Profile, Agency, Campaign)
    └── database.ts                    # Tipos auto-generados de Supabase
```

### Patrón de Server Actions

CreatorOS usa **React Server Actions** para todas las mutaciones de datos. Este patrón mantiene la lógica sensible en el servidor y simplifica el flujo:

```
Client Component → Server Action → Supabase → revalidatePath → UI actualizada
```

| Patrón | Uso |
|--------|-----|
| **Server Component** | Por defecto para páginas y layouts (data fetching) |
| **Client Component** | Solo para interactividad (formularios, DnD, gráficos) |
| **Server Action** | Mutaciones de datos (crear, actualizar, eliminar) |
| **Optimistic UI** | El Kanban actualiza la UI inmediatamente y persiste en background |

---

## 🗄 Base de Datos & Esquema (Supabase)

### Tablas Principales

```
┌──────────────────┐       ┌─────────────┐       ┌─────────────────┐
│     profiles      │       │  agencies    │       │   campaigns      │
├──────────────────┤       ├─────────────┤       ├─────────────────┤
│ id (PK)           │◄──────│ owner_id     │       │ id (PK)          │
│ email             │       │ id (PK)      │◄──────│ agency_id (FK)   │
│ username (UNIQUE) │       │ name         │       │ title            │
│ full_name         │       │ logo_url     │       │ brand_name       │
│ bio               │       │ website      │       │ budget           │
│ avatar_url        │       │ created_at   │       │ deadline         │
│ role (enum)       │       │ updated_at   │       │ status (enum)    │
│ agency_id (FK)    │──────►└─────────────┘       │ influencer_id(FK)│
│ created_at        │                              │ description      │
│ updated_at        │                              │ created_at       │
└──────────────────┘                              │ updated_at       │
                                                  └─────────────────┘
```

### Enums

| Enum | Valores |
|------|---------|
| `UserRole` | `creator`, `brand`, `agency`, `admin` |
| `CampaignStatus` (Kanban) | `negotiation`, `creation`, `review`, `published`, `payment_pending` |

### Row Level Security (RLS)

> [!IMPORTANT]
> Todas las tablas tienen **RLS habilitado**. Las políticas garantizan que cada usuario solo puede leer y modificar sus propios datos. El `updateCampaignStatus` server action verifica `influencer_id = auth.uid()` antes de actualizar. La página pública `/[username]` **nunca expone el campo `budget`**.

---

## ⚡ Instalación y Setup Local

### Requisitos Previos

- **Node.js** >= 18.17
- **npm** >= 9
- Cuenta de [Supabase](https://supabase.com) con un proyecto creado

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/creator-os.git
cd creator-os
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Supabase — Client-side (expuestas al browser)
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_proyecto
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key

# Supabase — Server-side only (nunca expuesta)
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

> [!CAUTION]
> **Nunca** subas el archivo `.env.local` a Git. Ya está incluido en `.gitignore`.

### 4. Configurar Supabase

1. Crea las tablas `profiles`, `agencies` y `campaigns` en el **SQL Editor** de Supabase.
2. Asegúrate de que `profiles` incluya las columnas `username` (type `text`, **UNIQUE**) y `bio` (type `text`).
3. Habilita **Row Level Security (RLS)** en cada tabla.
4. Configura la autenticación por email en **Authentication > Providers**.

### 5. Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## ✅ Features Actuales (MVP)

### 🔐 Autenticación
- [x] Login y Registro con Supabase Auth
- [x] Toggle dinámico entre modos Login ↔ Registro
- [x] Validación con **Zod** + **React Hook Form**
- [x] Protección de rutas server-side (`getUser()`)
- [x] Cierre de sesión con invalidación de cache

### 📊 Dashboard Shell
- [x] Sidebar responsive con navegación activa y iconos
- [x] Header sticky con email del usuario
- [x] Página home con KPIs reales (Campañas Activas, Ingresos del Mes, Equipo)
- [x] Feed de Actividad Reciente (últimas 3 campañas)
- [x] Sección "Equipo" solo visible para rol `agency`

### 🎯 Gestión de Campañas
- [x] **Tablero Kanban interactivo** con 5 columnas de pipeline
- [x] **Drag & Drop** con `@hello-pangea/dnd`
- [x] **Optimistic UI** con rollback automático si falla
- [x] Modal de creación con validación Zod
- [x] Toast notifications con **Sonner**
- [x] Verificación de propiedad (ownership check)

### 💰 Dashboard Financiero
- [x] **3 KPI Cards**: Ingresos Totales, Pendiente de Cobro, En Pipeline
- [x] **Gráfico AreaChart** (Recharts) con ingresos por mes (últimos 6 meses)
- [x] **Tabla de Transacciones** recientes con status badges
- [x] Cálculos server-side con aggregation sobre campañas

### 🌐 Media Kit Público
- [x] **Ruta dinámica** `/[username]` — sin autenticación requerida
- [x] Diseño estilo Linktree/CV moderno (mobile-first)
- [x] Avatar, Nombre, @username, Bio
- [x] Grid de portafolio (campañas completadas — **budget nunca expuesto**)
- [x] Botón "Contactar" con `mailto:`
- [x] SEO con `generateMetadata` dinámico
- [x] `notFound()` si el username no existe

### ⚙️ Configuración de Perfil
- [x] Formulario con preview de Avatar en vivo (Shadcn Avatar)
- [x] Username con prefijo visual `creatoros.com/`
- [x] Bio con contador de caracteres (160 máx)
- [x] Captura de **PostgreSQL 23505** (unique violation) → error amigable
- [x] Cambios reflejados inmediatamente en el Media Kit público

---

## 🛠 Guía de Desarrollo

### Comandos

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo (hot reload) |
| `npm run build` | Build de producción |
| `npm run start` | Inicia el servidor de producción |
| `npm run lint` | Ejecuta ESLint |

### Rutas de la Aplicación

| Ruta | Tipo | Descripción |
|------|------|-------------|
| `/` | `○ Static` | Landing page |
| `/login` | `○ Static` | Login / Registro |
| `/[username]` | `ƒ Dynamic` | Media Kit público |
| `/dashboard` | `ƒ Dynamic` | Dashboard home (KPIs) |
| `/dashboard/campaigns` | `ƒ Dynamic` | Tablero Kanban |
| `/dashboard/finance` | `ƒ Dynamic` | Dashboard Financiero |
| `/dashboard/settings` | `ƒ Dynamic` | Configuración de Perfil |

### Convenciones de Código

| Regla | Detalle |
|-------|---------|
| **Server Components por defecto** | Usamos `"use client"` solo cuando se necesita interactividad |
| **Server Actions para mutaciones** | Toda escritura a la DB va por Server Actions (`"use server"`) |
| **Validación con Zod** | Tanto en cliente (formularios) como en servidor (actions) |
| **Snake case para DB** | Los nombres de columnas siguen la convención de Supabase |
| **Shadcn UI** | Todos los componentes de UI base viven en `src/components/ui/` |
| **Route Groups** | `(auth)`, `(dashboard)`, `(public)` organizan sin afectar la URL |

### Stack Tecnológico

| Categoría | Tecnología | Versión |
|-----------|-----------|---------|
| Framework | Next.js (App Router) | 16 |
| Runtime | React | 19 |
| Lenguaje | TypeScript | 5 |
| Estilos | Tailwind CSS | v4 |
| Componentes | Shadcn UI | 3.x |
| BaaS | Supabase (Auth + DB) | 2.x |
| Drag & Drop | @hello-pangea/dnd | 18 |
| Gráficos | Recharts | 2.x |
| Formularios | React Hook Form + Zod | 7.x / 4.x |
| Iconos | Lucide React | 0.564 |
| Toasts | Sonner | 2.x |

---

<div align="center">

**Hecho con ☕ y Next.js**

</div>