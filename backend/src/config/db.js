const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Note que deve ser process.env.MONGODB_URI
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Conectado...');
  } catch (err) {
    console.error('Erro ao conectar ao MongoDB:', err.message);
    // Não use process.exit(1) aqui na Vercel, apenas dê o throw
    throw err;
  }
};

module.exports = connectDB;