const mongoose = require('mongoose');

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;

  try {
    console.log("Tentando conectar ao MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Diminui o tempo de espera para 5s
    });
    console.log('✅ MongoDB Conectado');
  } catch (error) {
    console.error('❌ Erro ao conectar ao MongoDB:', error.message);
    // Não encerra o processo para não derrubar a Vercel
  }
};

module.exports = connectDB;