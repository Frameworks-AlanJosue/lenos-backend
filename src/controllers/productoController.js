const QRCode = require("qrcode");
const Producto = require("../models/Producto");

// GET /api/productos  →  catálogo completo (con filtro por sabor)
const obtenerProductos = async (req, res) => {
  const { sabor, disponible, destacado } = req.query;
  const filtro = {};

  if (sabor) filtro.sabor = sabor;
  if (disponible !== undefined) filtro.disponible = disponible === "true";
  if (destacado !== undefined) filtro.destacado = destacado === "true";

  const productos = await Producto.find(filtro).sort({ destacado: -1, createdAt: -1 });
  res.json({ ok: true, total: productos.length, productos });
};

// GET /api/productos/:id  →  detalle de un producto (usado al escanear QR)
const obtenerProductoPorId = async (req, res) => {
  const producto = await Producto.findById(req.params.id);
  if (!producto) {
    res.status(404);
    throw new Error("Producto no encontrado");
  }
  res.json({ ok: true, producto });
};

// POST /api/productos  →  crear producto y generar su QR
const crearProducto = async (req, res) => {
  const producto = await Producto.create(req.body);

  // Generar QR apuntando a la URL del frontend para este producto
  const urlProducto = `${process.env.FRONTEND_URL}/productos/${producto._id}`;
  const qrDataURL = await QRCode.toDataURL(urlProducto, {
    errorCorrectionLevel: "H",
    width: 300,
  });

  producto.codigoQR = qrDataURL;
  await producto.save();

  res.status(201).json({ ok: true, producto });
};

// PUT /api/productos/:id  →  actualizar datos del producto
const actualizarProducto = async (req, res) => {
  const producto = await Producto.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!producto) {
    res.status(404);
    throw new Error("Producto no encontrado");
  }
  res.json({ ok: true, producto });
};

// PATCH /api/productos/:id/stock  →  ajustar stock del producto
const actualizarStock = async (req, res) => {
  const { cantidad } = req.body;
  if (cantidad === undefined) {
    res.status(400);
    throw new Error("Se requiere el campo 'cantidad'");
  }

  const producto = await Producto.findById(req.params.id);
  if (!producto) {
    res.status(404);
    throw new Error("Producto no encontrado");
  }

  const stockNuevo = producto.stock + cantidad;
  if (stockNuevo < 0) {
    res.status(400);
    throw new Error("El stock no puede quedar en negativo");
  }

  producto.stock = stockNuevo;
  producto.disponible = stockNuevo > 0;
  await producto.save();

  res.json({ ok: true, producto });
};

// DELETE /api/productos/:id  →  eliminar producto
const eliminarProducto = async (req, res) => {
  const producto = await Producto.findByIdAndDelete(req.params.id);
  if (!producto) {
    res.status(404);
    throw new Error("Producto no encontrado");
  }
  res.json({ ok: true, mensaje: "Producto eliminado correctamente" });
};

module.exports = {
  obtenerProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  actualizarStock,
  eliminarProducto,
};
