const express = require("express");
const router = express.Router();
const {
  obtenerPedidos,
  obtenerPedidoPorId,
  crearPedido,
  cambiarEstado,
  pedidosPorRepartidor,
} = require("../controllers/pedidoController");

// Cliente
router.post("/", crearPedido);
router.get("/:id", obtenerPedidoPorId);

// Admin
router.get("/", obtenerPedidos);
router.patch("/:id/estado", cambiarEstado);

// Repartidor
router.get("/repartidor/:repartidorId", pedidosPorRepartidor);

module.exports = router;
