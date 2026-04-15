# 🚀 Guía de Despliegue: Leños Rellenos en la Nube

Esta guía te ayudará a desplegar tu aplicación en **Railway** (Backend) y **Vercel** (Frontend) paso a paso.

---

## 📦 1. Pre-requisitos
1. Tener tus proyectos subidos a **GitHub** en dos repositorios distintos (uno para backend, uno para frontend).
2. Crear una cuenta en [Railway.app](https://railway.app) y en [Vercel.com](https://vercel.com). Ambos permiten login con GitHub.

---

## ⚙️ 2. Despliegue del Backend (Railway)

### Paso 2.1: Crear el proyecto
1. En Railway, haz clic en **+ New Project** -> **GitHub Repo**.
2. Selecciona tu repositorio de `lenos-backend`.
3. Haz clic en **Deploy Now**.

### Paso 2.2: Añadir la Base de Datos
1. En el mismo proyecto de Railway, haz clic en **+ Add** -> **Database** -> **MongoDB**.
2. Railway creará la base de datos automáticamente.

### Paso 2.3: Configurar Variables de Entorno en Railway
Ve a la pestaña **Variables** de tu servicio `app-logic` y añade:
- `JWT_SECRET`: (Tu secreto, ej: `desweb`)
- `API_KEY`: `clave_secreta_profe_123`
- `NODE_ENV`: `production`
- `FRONTEND_URL`: (Aquí pondrás la URL que te dará Vercel más adelante)

> [!NOTE]
> Railway inyecta automáticamente la variable `DATABASE_URL` o `MONGODB_URI`. No necesitas añadirla manualmente.

---

## 🎨 3. Despliegue del Frontend (Vercel)

### Paso 3.1: Importar el proyecto
1. En el Dashboard de Vercel, haz clic en **Add New** -> **Project**.
2. Selecciona tu repositorio de `lenos-frontend`.

### Paso 3.2: Configurar Variables de Entorno en Vercel
Antes de darle a "Deploy", abre la sección **Environment Variables** y añade:
- `VITE_API_URL`: `https://tu-backend.up.railway.app/api`
- `VITE_API_KEY`: `clave_secreta_profe_123`

### Paso 3.3: Desplegar
Haz clic en **Deploy**. ¡En un par de minutos tendrás tu URL pública!

---

## 🔗 4. El "Círculo de Seguridad" (Paso Final)
Para que todo funcione, debes volver a **Railway** y actualizar la variable `FRONTEND_URL` con la dirección que te dio Vercel (ej: `https://lenos-frontend.vercel.app`). Esto permite que el Backend acepte peticiones solo desde tu web oficial.

---

## ✅ Entregables para el Profesor
1. Copia la URL de tu frontend en Vercel.
2. Copia la URL de tu salud del backend: `https://tu-backend.up.railway.app/`.
3. Toma capturas de las secciones **Variables** en ambos paneles (Recuerda ocultar los valores sensibles con el botón del ojo).
