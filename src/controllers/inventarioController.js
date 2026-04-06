const Inventario = require("../models/Inventario");
const Producto = require("../models/Producto");

// GET /api/inventario  →  historial de movimientos
const obtenerMovimientos = async (req, res) => {
  const { productoId, tipo } = req.query;
  const filtro = {};
  if (productoId) filtro.producto = productoId;
  if (tipo) filtro.tipo = tipo;

  const movimientos = await Inventario.find(filtro)
    .populate("producto", "nombre sabor")
    .populate("registradoPor", "nombre")
    .sort({ createdAt: -1 })
    .limit(100);

  res.json({ ok: true, total: movimientos.length, movimientos });
};

// POST /api/inventario/ajuste  →  ajuste manual de stock (admin)
const ajustarStock = async (req, res) => {
  const { productoId, cantidad, motivo } = req.body;

  if (!productoId || cantidad === undefined || !motivo) {
    res.status(400);
    throw new Error("Se requieren: productoId, cantidad y motivo");
  }

  const producto = await Producto.findById(productoId);
  if (!producto) {
    res.status(404);
    throw new Error("Producto no encontrado");
  }

  const stockAnterior = producto.stock;
  const stockNuevo = producto.stock + cantidad;

  if (stockNuevo < 0) {
    res.status(400);
    throw new Error("El ajuste dejaría el stock en negativo");
  }

  producto.stock = stockNuevo;
  producto.disponible = stockNuevo > 0;
  await producto.save();

  const movimiento = await Inventario.create({
    producto: producto._id,
    tipo: "ajuste",
    cantidad,
    stockAnterior,
    stockNuevo,
    motivo,
  });

  res.status(201).json({ ok: true, movimiento, stockActual: producto.stock });
};

// GET /api/inventario/resumen  →  stock actual de todos los productos
const resumenStock = async (req, res) => {
  const productos = await Producto.find({}, "nombre sabor stock disponible").sort({ nombre: 1 });
  res.json({ ok: true, productos });
};

module.exports = { obtenerMovimientos, ajustarStock, resumenStock };
