<div align="center">

# 🚀 CreatorOS

### El Sistema Operativo Definitivo para Creadores de Contenido

**ERP + CRM + Motor Financiero** — Todo lo que necesitas para gestionar tu negocio como creador, en una sola plataforma.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?logo=supabase)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)

</div>

---

## 🎯 ¿Qué es CreatorOS?

CreatorOS es una plataforma integral diseñada para **creadores de contenido, influencers y agencias** que necesitan ir más allá de una hoja de cálculo. Centraliza la gestión de campañas, finanzas, equipo, clientes e ideas en un solo dashboard — para que sepas exactamente cuánto ganas, cuánto gastas, y cuánto vale tu hora.

---

## ✨ Características Principales

### 📋 Gestor de Campañas (Kanban)

- **Tablero drag & drop** con columnas personalizadas (Negociación → Publicado → Pagado).
- **Tarjetas inteligentes** con cálculo de **Beneficio Neto real** y **tarifa horaria efectiva** ($/hora).
- **Checklist interno (To-Do)** por campaña — añade tareas, márcalas como completadas, y visualiza el progreso (`☑️ 2/4`) directamente en la tarjeta.
- **Sistema de etiquetas** con colores para organizar por prioridad o tipo de contenido.
- **Automatización de estados**: arrastrar a "Pagado" cierra el ciclo financiero.
- **Archivo de campañas** para mantener el tablero limpio sin perder historial.

### 📁 Directorio (Mini-CRM)

- **Gestión de Marcas**: Registra tus clientes con industria, persona de contacto, guías de pricing y condiciones de pago.
- **Gestión de Proveedores/Equipo**: Añade editores, fotógrafos y colaboradores. Registra sus pagos y vincula cada pago a una campaña específica.
- **Historial de Pagos**: Consulta cuánto le has pagado a cada proveedor, con opción de eliminar registros.
- **Indicador "Total Pagado"** visible en cada tarjeta de proveedor.

### 💰 Motor Financiero Avanzado

- **Dashboard centralizado** con KPIs: Ingresos Cobrados, Gastos Totales, Beneficio Neto, Monto Pendiente.
- **Fórmula real de Beneficio Neto**: `Ingresos - Gastos de Campaña - Pagos a Proveedores`.
- **Desglose visual**: el KPI "Gastos Totales" muestra la separación entre gastos de campaña y pagos a equipo.
- **Gráficos mensuales** (Recharts) de ingresos vs. gastos con filtros por año y mes.
- **Distribución por categoría** (Producción, Viajes, Agencia, Impuestos, Proveedores) con gráfico de pastel.
- **Ingresos por plataforma** (Instagram, TikTok, YouTube, etc.).
- **Tarifa Horaria Efectiva** con formato estandarizado (`$64.85/h`).

### 💡 Banco de Ideas con IA

- **Generador de ideas** potenciado por Google Gemini: describe tu nicho y obtén ideas listas para producir.
- **Separación Borradores vs. Favoritas**: organiza tus mejores ideas para acceder rápido.
- **Creación manual** de ideas con título, descripción y plataforma destino.

### 🎨 Perfil Público (Media Kit)

- **Link-in-Bio** personalizable con avatar, bio y username único.
- **Embeds de video** (TikTok / Instagram Reels).
- **Página de configuración** para actualizar datos en tiempo real.

### 🔐 Seguridad

- **Autenticación** gestionada por Supabase Auth.
- **Row Level Security (RLS)** en todas las tablas: cada usuario solo ve sus propios datos.

---

## 🛠 Tech Stack

| Capa | Tecnología |
|------|-----------|
| **Framework** | Next.js 16 (App Router, Server Actions, RSC) |
| **Frontend** | React 19, TypeScript 5 |
| **Estilos** | Tailwind CSS 4, Shadcn UI, Radix Primitives |
| **Backend** | Supabase (PostgreSQL + Auth + RLS) |
| **IA** | Google Generative AI (Gemini) |
| **Visualización** | Recharts 3 |
| **Gestión Kanban** | @hello-pangea/dnd |
| **Formularios** | React Hook Form + Zod |
| **Notificaciones** | Sonner (Toasts) |

---

## 🗃 Arquitectura de Base de Datos

```
campaigns          → Campañas con estado, presupuesto, plataformas, etc.
expenses           → Gastos menores vinculados a campañas.
campaign_tasks     → Checklist (to-do) de tareas por campaña.
brands             → Directorio de marcas/clientes.
providers          → Directorio de proveedores/equipo.
provider_payments  → Pagos a proveedores, opcionalmente vinculados a campañas.
ideas              → Banco de ideas (borradores + favoritas).
profiles           → Perfiles públicos de usuarios.
```

---

## 🚀 Getting Started

### 1. Clonar el repositorio

```bash
git clone https://github.com/qoopadigital/Saas-Creadores-de-contenido.git
cd Saas-Creadores-de-contenido
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
GOOGLE_GENERATIVE_AI_API_KEY=tu_api_key_de_gemini
```

### 4. Iniciar el servidor de desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 🗺 Roadmap

- [x] Autenticación & Base de Datos (Supabase Auth + RLS)
- [x] Kanban & Workflow Automation
- [x] Módulo Financiero Completo (Ingresos, Gastos, Rentabilidad)
- [x] Perfil Público (Link in Bio / Media Kit)
- [x] Directorio / Mini-CRM (Marcas + Proveedores)
- [x] Sistema de Pagos a Proveedores
- [x] Checklist interno por Campaña (To-Do)
- [x] Banco de Ideas con generación IA
- [x] Gastos Recientes unificados en Dashboard
- [ ] Almacenamiento de archivos (Subida de Avatares/Tickets)
- [ ] Módulo de Agencia (Multi-talent management)
- [ ] Notificaciones y alertas de deadlines
- [ ] Exportación a PDF/Excel de reportes financieros

---

<div align="center">

Hecho con ❤️ por <b>Qoopa Agency</b>

</div>