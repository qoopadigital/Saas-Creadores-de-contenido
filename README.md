<div align="center">

# 🚀 CreatorOS (MVP)

**SaaS para la gestión profesional de Influencers y Creadores de Contenido.**

Centraliza la gestión de campañas, finanzas y tu Media Kit público en una sola plataforma.

[![Next.js](https://img.shields.io/badge/Next.js-14%2F15-black?logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20DB-3FCF8E?logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwindcss)](https://tailwindcss.com/)
[![Shadcn UI](https://img.shields.io/badge/Shadcn_UI-Components-000?logo=shadcnui)](https://ui.shadcn.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://typescriptlang.org/)

</div>

---

## 🛠 Stack Tecnológico

- **Core**: Next.js 14/15 (App Router), TypeScript.
- **Estilos**: Tailwind CSS, Shadcn UI, Lucide React.
- **Base de Datos & Auth**: Supabase (PostgreSQL + RLS).
- **Librerías Clave**:
  - `recharts` (Gráficos financieros).
  - `@hello-pangea/dnd` (Drag & drop del Kanban).
  - `react-hook-form` + `zod` (Formularios y Validación).
  - `react-social-media-embed` (Embeds de TikTok/IG/YouTube).

---

## ✨ Funcionalidades Implementadas (Estado Actual)

### 🔐 Autenticación
- Login con Magic Link (Supabase Auth).
- Protección de rutas y gestión de sesión.

### 📋 Gestión de Campañas (Kanban)
- **Tablero Drag & Drop**: Visualización intuitiva del flujo de trabajo.
- **CRUD Completo**: Crear, Editar (con pre-llenado), Eliminar (con confirmación).
- **Sistema de Etiquetas**: Priorización por colores (Tags) persistentes en DB y UI.

### 💰 Finanzas
- **Dashboard Visual**: KPIs en tiempo real (Ingresos Totales, Pendiente de Cobro).
- **Gráficos**: Evolución mensual de ingresos usando `recharts`.

### 🎨 Perfil Público (Media Kit 2.0)
- **Ruta Pública**: `/[username]` (SSR optimizado).
- **Client Wrapper**: Solución a problemas de hidratación en embeds.
- **Sistema de Plantillas**: Arquitectura lista para escalar (Default: 'Simple').
- **Embeds Multimedia**: Grid responsivo (3 columnas en desktop) para videos de TikTok/IG/YT.
- **Datos Estructurados**: Uso eficiente de columnas `JSONB` (`social_links`, `featured_content`, `selected_template`) en PostgreSQL.

### ⚙️ Configuración
- **Perfil Público**: Editor visual dedicado con previsualización y límite de 9 videos.
- **Ajustes de Cuenta**: Gestión privada de datos personales.

---

## 🚀 Guía de Instalación Rápida

1.  **Clonar el repositorio**:
    ```bash
    git clone <repo_url>
    cd creator-os
    ```

2.  **Instalar dependencias**:
    ```bash
    npm install
    ```

3.  **Configurar variables de entorno**:
    Crea un archivo `.env.local` con tus credenciales de Supabase:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_project_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
    ```

4.  **Iniciar servidor de desarrollo**:
    ```bash
    npm run dev
    ```

---

## ✅ Estado del Proyecto

- [x] **Autenticación & Base de Datos**
- [x] **Kanban (Full Features)**
- [x] **Perfil Público (Visualización & Edición)**
- [ ] Subida de Imágenes (Storage)
- [ ] Integración de Pagos (Stripe)
- [ ] Módulo de Agencia (B2B)

---

<div align="center">
  Hecho con ❤️ y Next.js por <b>Daniela Giraldo Pardo</b>
</div>