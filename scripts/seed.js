require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../src/config/db");
const Producto = require("../src/models/Producto");
const Usuario = require("../src/models/Usuario");
const Inventario = require("../src/models/Inventario");

const productosEjemplo = [
  {
    nombre: "Leño Relleno de Chocolate",
    descripcion: "Crujiente por fuera, suave y lleno de sabor por dentro. Relleno generoso de chocolate oscuro derretido.",
    sabor: "Chocolate",
    precio: 45,
    stock: 20,
    disponible: true,
    destacado: true,
    imagenes: [{ url: "https://placehold.co/600x400?text=Leño+Chocolate", alt: "Leño Relleno de Chocolate" }],
  },
  {
    nombre: "Leño Relleno de Nuez",
    descripcion: "Textura única con trozos de nuez caramelizada. El favorito de los que buscan algo especial.",
    sabor: "Nuez",
    precio: 50,
    stock: 15,
    disponible: true,
    destacado: false,
    imagenes: [{ url: "https://placehold.co/600x400?text=Leño+Nuez", alt: "Leño Relleno de Nuez" }],
  },
  {
    nombre: "Leño Relleno de Cajeta",
    descripcion: "El sabor de la tradición mexicana en cada mordida. Cajeta artesanal que fluye con cada bocado.",
    sabor: "Cajeta",
    precio: 48,
    stock: 10,
    disponible: true,
    destacado: true,
    imagenes: [{ url: "https://placehold.co/600x400?text=Leño+Cajeta", alt: "Leño Relleno de Cajeta" }],
  },
  {
    nombre: "Leño Mixto (Choco-Nuez)",
    descripcion: "Lo mejor de dos mundos: chocolate y nuez juntos en un solo leño.",
    sabor: "Mixto",
    precio: 55,
    stock: 8,
    disponible: true,
    destacado: false,
    imagenes: [{ url: "https://placehold.co/600x400?text=Leño+Mixto", alt: "Leño Mixto" }],
  },
];

const usuariosEjemplo = [
  { nombre: "María García", telefono: "4421234567", rol: "administrador" },
  { nombre: "Carlos López", telefono: "4429876543", rol: "repartidor" },
  { nombre: "Juan Pérez",   telefono: "4425551234", rol: "repartidor" },
];

const seed = async () => {
  await connectDB();

  console.log("🧹 Limpiando colecciones...");
  await Producto.deleteMany({});
  await Usuario.deleteMany({});
  await Inventario.deleteMany({});

  console.log("🌱 Insertando productos...");
  const productos = await Producto.insertMany(productosEjemplo);

  // Registrar entrada inicial de inventario por cada producto
  for (const p of productos) {
    await Inventario.create({
      producto: p._id,
      tipo: "entrada",
      cantidad: p.stock,
      stockAnterior: 0,
      stockNuevo: p.stock,
      motivo: "Stock inicial (seed)",
    });
  }

  console.log("👥 Insertando usuarios...");
  await Usuario.insertMany(usuariosEjemplo);

  console.log("✅ Seed completado exitosamente");
  console.log(`   • ${productos.length} productos creados`);
  console.log(`   • ${usuariosEjemplo.length} usuarios creados`);

  mongoose.connection.close();
};

seed().catch((err) => {
  console.error("❌ Error en seed:", err);
  process.exit(1);
});
