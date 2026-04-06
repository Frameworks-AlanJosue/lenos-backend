# 🍞 Leños Rellenos — Backend API

API REST construida con **Node.js + Express + MongoDB** para la microempresa de Leños Rellenos.

---

## 🚀 Instalación y arranque

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Edita .env con tu URI de MongoDB y número de WhatsApp del admin

# 3. (Opcional) Poblar la base de datos con datos de ejemplo
npm run seed

# 4. Iniciar en modo desarrollo
npm run dev

# 4b. Iniciar en producción
npm start
```

El servidor queda disponible en `http://localhost:3000`.

---

## 🗂️ Estructura del proyecto

```
lenos-backend/
├── src/
│   ├── config/
│   │   └── db.js                # Conexión a MongoDB
│   ├── controllers/
│   │   ├── productoController.js
│   │   ├── pedidoController.js
│   │   ├── inventarioController.js
│   │   └── usuarioController.js
│   ├── middleware/
│   │   └── errorHandler.js      # Manejo centralizado de errores
│   ├── models/
│   │   ├── Producto.js
│   │   ├── Pedido.js
│   │   ├── Inventario.js
│   │   └── Usuario.js
│   ├── routes/
│   │   ├── productos.js
│   │   ├── pedidos.js
│   │   ├── inventario.js
│   │   └── usuarios.js
│   └── index.js                 # Punto de entrada
├── scripts/
│   └── seed.js                  # Datos de ejemplo
├── .env.example
└── package.json
```

---

## 📡 Endpoints

### Productos — `/api/productos`

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/productos` | Catálogo completo. Filtros: `?sabor=Chocolate&disponible=true&destacado=true` |
| GET | `/api/productos/:id` | Detalle de un producto (se usa al escanear QR) |
| POST | `/api/productos` | Crear producto (genera QR automáticamente) |
| PUT | `/api/productos/:id` | Actualizar producto |
| PATCH | `/api/productos/:id/stock` | Ajustar stock (`{ "cantidad": 10 }` para sumar, `-5` para restar) |
| DELETE | `/api/productos/:id` | Eliminar producto |

**Ejemplo — Crear producto:**
```json
POST /api/productos
{
  "nombre": "Leño Relleno de Chocolate",
  "descripcion": "Crujiente por fuera, suave y lleno de sabor por dentro",
  "sabor": "Chocolate",
  "precio": 45,
  "stock": 20,
  "destacado": true,
  "imagenes": [{ "url": "https://...", "alt": "Leño de Chocolate" }]
}
```

---

### Pedidos — `/api/pedidos`

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/pedidos` | Crear pedido (cliente). Devuelve `whatsappURL` para notificar al admin |
| GET | `/api/pedidos/:id` | Consultar estado de un pedido |
| GET | `/api/pedidos` | Listar todos los pedidos (admin). Filtros: `?estado=pendiente&tipoPedido=mismo_dia&fecha=2025-01-20` |
| PATCH | `/api/pedidos/:id/estado` | Cambiar estado del pedido |
| GET | `/api/pedidos/repartidor/:id` | Pedidos asignados a un repartidor |

**Ejemplo — Pedido mismo día:**
```json
POST /api/pedidos
{
  "cliente": {
    "nombre": "Ana Ramírez",
    "telefono": "4421234567",
    "direccion": "Calle Hidalgo 123, Centro"
  },
  "items": [
    { "productoId": "6789...", "cantidad": 2 }
  ],
  "tipoPedido": "mismo_dia"
}
```

**Ejemplo — Pre-pedido:**
```json
POST /api/pedidos
{
  "cliente": { "nombre": "Luis Torres", "telefono": "4429876543", "direccion": "Av. Constitución 45" },
  "items": [{ "productoId": "6789...", "cantidad": 3 }],
  "tipoPedido": "pre_pedido",
  "fechaEntregaSolicitada": "2025-01-25"
}
```

**Ejemplo — Cambiar estado (admin confirma / repartidor entrega):**
```json
PATCH /api/pedidos/:id/estado
{
  "estado": "en_entrega",
  "repartidorId": "abc123..."
}
```

**Estados posibles:** `pendiente → confirmado → en_entrega → entregado` (o `cancelado`)

---

### Inventario — `/api/inventario`

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/inventario` | Historial de movimientos. Filtros: `?productoId=...&tipo=salida` |
| GET | `/api/inventario/resumen` | Stock actual de todos los productos |
| POST | `/api/inventario/ajuste` | Ajuste manual de stock |

**Ejemplo — Ajuste manual:**
```json
POST /api/inventario/ajuste
{
  "productoId": "6789...",
  "cantidad": 5,
  "motivo": "Reposición de producción"
}
```

---

### Usuarios — `/api/usuarios`

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/usuarios` | Listar usuarios. Filtro: `?rol=repartidor` |
| POST | `/api/usuarios` | Crear usuario |
| PUT | `/api/usuarios/:id` | Actualizar usuario |

---

## 💬 Flujo WhatsApp

Al crear un pedido, la respuesta incluye `whatsappURL`. El frontend debe abrir esa URL para que el cliente (o la app) notifique al administrador automáticamente:

```javascript
// En el frontend React
window.open(data.whatsappURL, "_blank");
```

El mensaje llega pre-llenado al WhatsApp del admin con todos los datos del pedido.

---

## 🔄 Flujo de estados del pedido

```
Cliente crea pedido
       │
       ▼
  [pendiente]  ←── Admin recibe notificación WhatsApp
       │
       ▼
  [confirmado] ←── Admin confirma y asigna repartidor
       │              (si es pre_pedido: se descuenta stock aquí)
       ▼
 [en_entrega]  ←── Repartidor sale a entregar
       │
       ▼
  [entregado]  ←── Repartidor confirma entrega exitosa
```

---

## 🧩 Variables de entorno (`.env`)

| Variable | Descripción |
|----------|-------------|
| `PORT` | Puerto del servidor (default: 3000) |
| `MONGODB_URI` | URI de conexión a MongoDB |
| `NODE_ENV` | `development` o `production` |
| `ADMIN_WHATSAPP` | Número del admin sin `+` (ej: `521XXXXXXXXXX`) |
| `FRONTEND_URL` | URL del frontend para los QR generados |
