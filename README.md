<div align="center">

# CreatorOS (MVP v0.8)

**El Sistema Operativo integral para Creadores de Contenido y Agencias.**

</div>

---

## 🛠 Stack Tecnológico

- **Framework**: Next.js 15 (App Router), TypeScript.
- **Estilos**: Tailwind CSS, Shadcn UI.
- **Backend**: Supabase (PostgreSQL, Auth, RLS).
- **Visualización**: Recharts (Gráficos Financieros).
- **Gestión**: @hello-pangea/dnd (Kanban).

---

## ✨ Core Features (Lo Nuevo)

### 💸 Suite Financiera (Nuevo)

- **P&L en Tiempo Real**: Cálculo automático de Ingresos Brutos, Gastos (COGS/OpEx) y Beneficio Neto.
- **Calculadora de Rentabilidad**: Análisis de tarifa horaria efectiva ($/hora) por proyecto.
- **Gestión de Flujo de Caja**: Control de estados (Pendiente, Facturado, Pagado, Vencido).
- **Facturación Flexible**: Soporte para flujo 'Hobby' (sin factura) y 'Pro' (con datos fiscales y trazabilidad).
- **Control de Gastos**: Registro de tickets y categorización (Producción, Viajes, Agencia).

### 📋 Gestión de Campañas (Kanban 2.0)

- **Tablero con automatización de estados**: Arrastrar a 'Pagado' cierra el ciclo financiero.
- **Tarjetas inteligentes**: Indicadores de Facturación (No. Factura) y Rentabilidad (Horas Reales).
- **Sistema de Etiquetas**: Organización visual por prioridades.

### 🎨 Perfil Público (Media Kit)

- **Link-in-Bio personalizable**: Con embeds de video (TikTok/IG).
- **Grid responsivo**: Optimizado para conversión.

---

## 🗺 Estado del Proyecto (Roadmap)

- [x] **Autenticación & Base de Datos**
- [x] **Kanban & Workflow Automation**
- [x] **Módulo Financiero Completo (Ingresos, Gastos, Rentabilidad)**
- [x] **Perfil Público (Link in Bio)**
- [ ] Almacenamiento (Subida de Avatares/Tickets)
- [ ] Módulo de Agencia (Multi-talent management)

---

## 🚀 Setup

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
    Crea un archivo `.env.local`:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_project_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
    ```

4.  **Iniciar servidor de desarrollo**:
    ```bash
    npm run dev
    ```

---

<div align="center">
  Hecho con ❤️ por <b>Qoopa Agency</b>
</div>