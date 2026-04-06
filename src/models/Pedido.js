const mongoose = require("mongoose");

// Sub-esquema de cada ítem del pedido
const itemPedidoSchema = new mongoose.Schema({
  producto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Producto",
    required: true,
  },
  nombre: { type: String, required: true },   // snapshot del nombre al comprar
  sabor: { type: String, required: true },
  cantidad: { type: Number, required: true, min: 1 },
  precioUnitario: { type: Number, required: true },
});

const pedidoSchema = new mongoose.Schema(
  {
    // ── Datos del cliente ──────────────────────────────────────────────
    cliente: {
      nombre: { type: String, required: [true, "El nombre es obligatorio"], trim: true },
      telefono: { type: String, required: [true, "El teléfono es obligatorio"], trim: true },
      direccion: { type: String, required: [true, "La dirección es obligatoria"], trim: true },
    },

    // ── Productos del pedido ───────────────────────────────────────────
    items: {
      type: [itemPedidoSchema],
      validate: {
        validator: (v) => v.length > 0,
        message: "El pedido debe tener al menos un producto",
      },
    },

    // ── Totales ────────────────────────────────────────────────────────
    total: { type: Number, default: 0, min: 0 },

    // ── Tipo de pedido (pre-pedido vs mismo día) ───────────────────────
    tipoPedido: {
      type: String,
      enum: ["mismo_dia", "pre_pedido"],
      required: true,
    },
    fechaEntregaSolicitada: {
      // Obligatorio para pre_pedido, opcional para mismo_dia
      type: Date,
    },

    // ── Estado del pedido (barra de progreso del cliente) ──────────────
    estado: {
      type: String,
      enum: ["pendiente", "confirmado", "en_entrega", "entregado", "cancelado"],
      default: "pendiente",
    },

    // ── Notificaciones ─────────────────────────────────────────────────
    whatsappEnviado: {
      // true cuando se notificó al admin vía WhatsApp
      type: Boolean,
      default: false,
    },

    // ── Repartidor asignado ────────────────────────────────────────────
    repartidor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      default: null,
    },

    // ── Notas internas ─────────────────────────────────────────────────
    notas: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

// Calcula el total automáticamente antes de guardar
pedidoSchema.pre("save", function (next) {
  if (this.items && this.items.length > 0) {
    this.total = this.items.reduce(
      (sum, item) => sum + item.precioUnitario * item.cantidad,
      0
    );
  }
  next();
});

module.exports = mongoose.model("Pedido", pedidoSchema);
