const mongoose = require("mongoose");

const movimientoSchema = new mongoose.Schema(
  {
    producto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Producto",
      required: true,
    },
    tipo: {
      type: String,
      enum: ["entrada", "salida", "ajuste"],
      required: true,
    },
    cantidad: {
      type: Number,
      required: true,
    },
    stockAnterior: { type: Number, required: true },
    stockNuevo: { type: Number, required: true },
    motivo: {
      // Ej: "Venta pedido #123", "Reposición", "Corrección manual"
      type: String,
      default: "",
    },
    pedido: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pedido",
      default: null,
    },
    registradoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Inventario", movimientoSchema);
