# 🚀 Guía de Despliegue: Leños Rellenos en la Nube (Render + Vercel)

Esta guía te ayudará a desplegar tu aplicación usando **Render** para el Backend y **Vercel** para el Frontend. Usaremos tu base de datos existente de **MongoDB Atlas**.

---

## 📦 1. Pre-requisitos
1. Tener tus proyectos subidos a **GitHub** en dos repositorios distintos.
2. Tener a mano tu **Connection String** de MongoDB Atlas (ej: `mongodb+srv://usuario:password@cluster.mongodb.net/Pedidos`).

---

## ⚙️ 2. Despliegue del Backend (Render)

### Paso 2.1: Crear el Web Service
1. Entra a [Render.com](https://render.com) y crea una cuenta con GitHub.
2. Haz clic en **+ New** -> **Web Service**.
3. Selecciona tu repositorio de `lenos-backend`.
4. Configuración:
   - **Name**: `lenos-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/index.js`
   - **Instance Type**: `Free`

### Paso 2.2: Configurar Variables de Entorno en Render
En la misma pantalla, ve a la pestaña **Environment** (o haz clic en "Advanced") y añade:
- `MONGODB_URI`: (Tu Connection String de Atlas, asegúrate de que incluya el nombre de la DB `/Pedidos`)
- `JWT_SECRET`: `desweb` (o el que prefieras)
- `API_KEY`: `clave_secreta_profe_123`
- `NODE_ENV`: `production`
- `FRONTEND_URL`: (La pondrás después de desplegar en Vercel)

5. Haz clic en **Create Web Service**. ¡Render empezará a desplegar!

---

## 🎨 3. Despliegue del Frontend (Vercel)

### Paso 3.1: Importar el proyecto
1. Entra a [Vercel.com](https://vercel.com) y selecciona tu repositorio de `lenos-frontend`.

### Paso 3.2: Configurar Variables de Entorno en Vercel
Antes de darle a "Deploy", abre la sección **Environment Variables** y añade:
- `VITE_API_URL`: `https://tu-app-en-render.onrender.com/api`
- `VITE_API_KEY`: `clave_secreta_profe_123`

3. Haz clic en **Deploy**. ¡Tendrás tu URL en un par de minutos!

---

## 🔗 4. El "Círculo de Seguridad" (Paso Final)
Para que todo funcione, debes volver a **Render** -> **Environment** y actualizar la variable `FRONTEND_URL` con la dirección que te dio Vercel (ej: `https://lenos-frontend.vercel.app`). Esto permite que el Backend acepte las llamadas de tu web.

---

## ✅ Entregables para el Profesor
1. URL de tu frontend en Vercel.
2. URL de saludo del backend: `https://tu-app.onrender.app/` (Verifica que diga "Funcionando correctamente").
3. Capturas de las secciones **Environment/Variables** en ambos paneles.

> [!NOTE]
> Recuerda que en el Plan Free de Render, la API tarda unos 30-50 segundos en arrancar si no ha recibido visitas en un rato. ¡Ten paciencia la primera vez que abras la web!
