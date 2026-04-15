require("dotenv").config();
require('express-async-errors');

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoSanitize = require('express-mongo-sanitize');
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorHandler");
const { comentariosLimiter, apiLimiter } = require("./middleware/rateLimiter");
const { validarComentario } = require("./middleware/validacionComentario");
const apiKeyMiddleware = require("./middleware/apiKey");

// ── Rutas ────────────────────────────────────────────────────────────────────
const productosRoutes  = require("./routes/productos");
const pedidosRoutes    = require("./routes/pedidos");
const inventarioRoutes = require("./routes/inventario");
const usuariosRoutes   = require("./routes/usuarios");
const usuariosAuthRoutes = require("./routes/usuariosAuth");

// ── Conexión a base de datos ──────────────────────────────────────────────────
connectDB();

const app = express();

// ── Middlewares de Seguridad ──────────────────────────────────────────────────
// Helmet: Configura automáticamente cabeceras HTTP seguras
// Incluye Content-Security-Policy, X-Content-Type-Options, X-Frame-Options, etc.
app.use(helmet());

// CORS: Dinámico según la variable FRONTEND_URL (para Vercel/Producción)
const allowedOrigins = [
  "http://localhost:5173", 
  "http://localhost:3000",
  process.env.FRONTEND_URL // URL de Vercel inyectada vía env
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Permitir peticiones sin origen (como scripts locales o curl) en desarrollo
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Acceso bloqueado por política de CORS'));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization", "x-api-key"],
  credentials: true
};
app.use(cors(corsOptions));

app.use(express.json());

// Morgan: Solo logs detallados en desarrollo
const logFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(logFormat));

// ── Protección Global por API Key ─────────────────────────────────────────────
// Todas las rutas de la API requerirán x-api-key en los headers
app.use("/api", apiKeyMiddleware);

// ── Sanitización de MongoDB (previene inyección NoSQL)
app.use(mongoSanitize());

// ── Rate Limiting general para API
app.use("/api/", apiLimiter);

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    ok: true,
    mensaje: "🍞 API Leños Rellenos funcionando correctamente",
    version: "1.0.0",
    endpoints: [
      "/api/productos",
      "/api/pedidos",
      "/api/inventario",
      "/api/usuarios",
      "/api/v1/comentarios",
      "/api/v1/usuario/signup",
      "/api/v1/usuario/login"
    ],
  });
});

// ── Endpoint de Comentarios (Ejercicio de Seguridad - Práctica 3) ──────────────
/**
 * POST /api/v1/comentarios
 * Seguridad implementada:
 * 1. Rate Limiting: Máximo 10 peticiones por minuto por IP
 * 2. Validación: texto requerido, máximo 200 caracteres, puntuación entero 1-5
 * 3. Sanitización: Elimina HTML/JS malicioso con DOMPurify
 * 4. Mongo Sanitize: Previene inyección NoSQL
 */
app.post("/api/v1/comentarios", comentariosLimiter, validarComentario, (req, res) => {
  const { texto, puntuacion } = req.body;

  // El texto ya está sanitizado por el middleware validarComentario
  res.json({
    ok: true,
    mensaje: "Comentario recibido exitosamente",
    comentario: {
      texto: texto,
      puntuacion: puntuacion || null,
      longitud: texto.length,
      caracteresRestantes: 200 - texto.length
    },
    seguridad: {
      rateLimited: true,
      validado: true,
      sanitizado: true
    },
    timestamp: new Date().toISOString()
  });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use("/api/productos",    productosRoutes);
app.use("/api/pedidos",      pedidosRoutes);
app.use("/api/inventario",   inventarioRoutes);
app.use("/api/usuarios",     usuariosRoutes);
app.use("/api/v1/usuario",   usuariosAuthRoutes);

// ── Manejo de errores ─────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Servidor ──────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`🌿 Entorno: ${process.env.NODE_ENV}`);
});
