const express = require("express");
const router = express.Router();
const {
  obtenerProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  actualizarStock,
  eliminarProducto,
} = require("../controllers/productoController");

// Catálogo (cliente)
router.get("/", obtenerProductos);
router.get("/:id", obtenerProductoPorId);

// Administración (admin)
router.post("/", crearProducto);
router.put("/:id", actualizarProducto);
router.patch("/:id/stock", actualizarStock);
router.delete("/:id", eliminarProducto);

module.exports = router;
