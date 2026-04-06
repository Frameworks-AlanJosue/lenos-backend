const mongoose = require("mongoose");

const productoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre del producto es obligatorio"],
      trim: true,
    },
    descripcion: {
      type: String,
      required: [true, "La descripción es obligatoria"],
      // Ej: "Crujiente por fuera, suave y lleno de sabor por dentro"
    },
    sabor: {
      type: String,
      required: [true, "El sabor es obligatorio"],
      enum: ["Chocolate", "Nuez", "Cajeta", "Mixto"],
    },
    precio: {
      type: Number,
      required: [true, "El precio es obligatorio"],
      min: [0, "El precio no puede ser negativo"],
    },
    imagenes: [
      {
        url: { type: String, required: true },
        alt: { type: String, default: "" },
      },
    ],
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "El stock no puede ser negativo"],
    },
    disponible: {
      type: Boolean,
      default: true,
    },
    codigoQR: {
      // URL generada con la librería qrcode, apunta al detalle del producto
      type: String,
      default: "",
    },
    destacado: {
      // Para la sección "Promociones destacadas" del módulo Inicio
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Método para saber si hay stock disponible
productoSchema.methods.hayStock = function () {
  return this.stock > 0 && this.disponible;
};

module.exports = mongoose.model("Producto", productoSchema);
