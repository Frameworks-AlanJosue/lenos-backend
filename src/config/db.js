const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoUri = process.env.DATABASE_URL || process.env.MONGODB_URI;
    const conn = await mongoose.connect(mongoUri);
    
    // Log seguro: omitir el string de conexión si no estamos en desarrollo
    if (process.env.NODE_ENV === 'development') {
        console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
    } else {
        console.log(`✅ MongoDB conectado exitosamente`);
    }
  } catch (error) {
    console.error(`❌ Error al conectar MongoDB`);
    process.exit(1);
  }
};

module.exports = connectDB;
