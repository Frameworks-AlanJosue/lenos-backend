require("dotenv").config();
require('express-async-errors'); 

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorHandler");

// ── Rutas ────────────────────────────────────────────────────────────────────
const productosRoutes  = require("./routes/productos");
const pedidosRoutes    = require("./routes/pedidos");
const inventarioRoutes = require("./routes/inventario");
const usuariosRoutes   = require("./routes/usuarios");

// ── Conexión a base de datos ──────────────────────────────────────────────────
connectDB();

const app = express();

// ── Middlewares globales ──────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    ok: true,
    mensaje: "🍞 API Leños Rellenos funcionando correctamente",
    version: "1.0.0",
    endpoints: ["/api/productos", "/api/pedidos", "/api/inventario", "/api/usuarios"],
  });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use("/api/productos",  productosRoutes);
app.use("/api/pedidos",    pedidosRoutes);
app.use("/api/inventario", inventarioRoutes);
app.use("/api/usuarios",   usuariosRoutes);

// ── Manejo de errores ─────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Servidor ──────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`🌿 Entorno: ${process.env.NODE_ENV}`);
});
