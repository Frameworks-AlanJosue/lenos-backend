const Pedido = require("../models/Pedido");
const Producto = require("../models/Producto");
const Inventario = require("../models/Inventario");

// Genera el mensaje pre-llenado para WhatsApp del administrador
const generarMensajeWhatsApp = (pedido) => {
  const itemsTexto = pedido.items
    .map((i) => `  • ${i.nombre} (${i.sabor}) x${i.cantidad} = $${i.precioUnitario * i.cantidad}`)
    .join("\n");

  const tipo =
    pedido.tipoPedido === "mismo_dia"
      ? "📦 PEDIDO MISMO DÍA"
      : `📅 PRE-PEDIDO para ${new Date(pedido.fechaEntregaSolicitada).toLocaleDateString("es-MX")}`;

  const mensaje = `🛒 NUEVO PEDIDO - Leños Rellenos\n\n${tipo}\n\n👤 Cliente: ${pedido.cliente.nombre}\n📱 Teléfono: ${pedido.cliente.telefono}\n📍 Dirección: ${pedido.cliente.direccion}\n\n🍞 Productos:\n${itemsTexto}\n\n💰 Total: $${pedido.total}\n\nID Pedido: ${pedido._id}`;

  return encodeURIComponent(mensaje);
};

// GET /api/pedidos  →  listar pedidos (admin)
const obtenerPedidos = async (req, res) => {
  const { estado, tipoPedido, fecha } = req.query;
  const filtro = {};

  if (estado) filtro.estado = estado;
  if (tipoPedido) filtro.tipoPedido = tipoPedido;
  if (fecha) {
    const inicio = new Date(fecha);
    inicio.setHours(0, 0, 0, 0);
    const fin = new Date(fecha);
    fin.setHours(23, 59, 59, 999);
    filtro.createdAt = { $gte: inicio, $lte: fin };
  }

  const pedidos = await Pedido.find(filtro)
    .populate("repartidor", "nombre telefono")
    .sort({ createdAt: -1 });

  res.json({ ok: true, total: pedidos.length, pedidos });
};

// GET /api/pedidos/:id  →  detalle de un pedido
const obtenerPedidoPorId = async (req, res) => {
  const pedido = await Pedido.findById(req.params.id).populate("repartidor", "nombre telefono");
  if (!pedido) {
    res.status(404);
    throw new Error("Pedido no encontrado");
  }
  res.json({ ok: true, pedido });
};

// POST /api/pedidos  →  crear un pedido (cliente)
const crearPedido = async (req, res) => {
  const { cliente, items, tipoPedido, fechaEntregaSolicitada, notas } = req.body;

  // Validar tipo de pedido
  if (tipoPedido === "pre_pedido" && !fechaEntregaSolicitada) {
    res.status(400);
    throw new Error("Los pre-pedidos requieren una fecha de entrega");
  }

  // Verificar disponibilidad y construir items con snapshot de precios
  const itemsConPrecio = [];
  for (const item of items) {
    const producto = await Producto.findById(item.productoId);

    if (!producto) {
      res.status(404);
      throw new Error(`Producto ${item.productoId} no encontrado`);
    }

    if (tipoPedido === "mismo_dia" && producto.stock < item.cantidad) {
      res.status(400);
      throw new Error(
        `"${producto.nombre}" no tiene suficiente stock. Disponible: ${producto.stock}`
      );
    }

    itemsConPrecio.push({
      producto: producto._id,
      nombre: producto.nombre,
      sabor: producto.sabor,
      cantidad: item.cantidad,
      precioUnitario: producto.precio,
    });
  }

  const pedido = await Pedido.create({
    cliente,
    items: itemsConPrecio,
    tipoPedido,
    fechaEntregaSolicitada: tipoPedido === "pre_pedido" ? fechaEntregaSolicitada : undefined,
    notas,
  });

  // Si es mismo día: descontar stock inmediatamente y registrar movimiento
  if (tipoPedido === "mismo_dia") {
    for (const item of itemsConPrecio) {
      const producto = await Producto.findById(item.producto);
      const stockAnterior = producto.stock;
      producto.stock -= item.cantidad;
      producto.disponible = producto.stock > 0;
      await producto.save();

      await Inventario.create({
        producto: producto._id,
        tipo: "salida",
        cantidad: item.cantidad,
        stockAnterior,
        stockNuevo: producto.stock,
        motivo: `Venta pedido #${pedido._id}`,
        pedido: pedido._id,
      });
    }
  }

  // Construir link de WhatsApp para el admin
  const mensajeWA = generarMensajeWhatsApp(pedido);
  const whatsappURL = `https://wa.me/${process.env.ADMIN_WHATSAPP}?text=${mensajeWA}`;

  res.status(201).json({
    ok: true,
    pedido,
    whatsappURL, // El frontend abre esta URL para notificar al admin
  });
};

// PATCH /api/pedidos/:id/estado  →  cambiar estado del pedido (admin / repartidor)
const cambiarEstado = async (req, res) => {
  const { estado, repartidorId } = req.body;
  const estadosValidos = ["pendiente", "confirmado", "en_entrega", "entregado", "cancelado"];

  if (!estadosValidos.includes(estado)) {
    res.status(400);
    throw new Error(`Estado inválido. Opciones: ${estadosValidos.join(", ")}`);
  }

  const pedido = await Pedido.findById(req.params.id);
  if (!pedido) {
    res.status(404);
    throw new Error("Pedido no encontrado");
  }

  // Si el pedido se confirma y es pre_pedido, descontar stock ahora
  if (estado === "confirmado" && pedido.tipoPedido === "pre_pedido") {
    for (const item of pedido.items) {
      const producto = await Producto.findById(item.producto);
      if (!producto || producto.stock < item.cantidad) {
        res.status(400);
        throw new Error(`Stock insuficiente para confirmar el pedido de "${item.nombre}"`);
      }
      const stockAnterior = producto.stock;
      producto.stock -= item.cantidad;
      producto.disponible = producto.stock > 0;
      await producto.save();

      await Inventario.create({
        producto: producto._id,
        tipo: "salida",
        cantidad: item.cantidad,
        stockAnterior,
        stockNuevo: producto.stock,
        motivo: `Confirmación pre-pedido #${pedido._id}`,
        pedido: pedido._id,
      });
    }
  }

  pedido.estado = estado;
  if (repartidorId) pedido.repartidor = repartidorId;
  if (estado === "confirmado") pedido.whatsappEnviado = true;
  await pedido.save();

  await pedido.populate("repartidor", "nombre telefono");
  res.json({ ok: true, pedido });
};

// GET /api/pedidos/repartidor/:repartidorId  →  pedidos asignados al repartidor
const pedidosPorRepartidor = async (req, res) => {
  const pedidos = await Pedido.find({
    repartidor: req.params.repartidorId,
    estado: { $in: ["confirmado", "en_entrega"] },
  }).sort({ createdAt: 1 });

  res.json({ ok: true, total: pedidos.length, pedidos });
};

module.exports = {
  obtenerPedidos,
  obtenerPedidoPorId,
  crearPedido,
  cambiarEstado,
  pedidosPorRepartidor,
};
