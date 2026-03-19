require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Importação direta da rota de auth para evitar erros de outros arquivos
const authRoutes = require('./routes/auth');

const app = express();

// 1. CORS CONFIGURADO PARA ACEITAR TUDO DURANTE O TESTE
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Responder imediatamente ao Preflight (OPTIONS)
app.options('*', cors());

app.use(express.json());

// 2. CONEXÃO COM O MONGO OTIMIZADA
// Usamos uma variável para checar se já está conectado (evita múltiplas instâncias na Vercel)
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  try {
    const db = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000 // Se não conectar em 5s, ele pula para não dar 504
    });
    isConnected = db.connections[0].readyState;
    console.log("MongoDB Conectado");
  } catch (err) {
    console.error("Erro Mongo:", err.message);
  }
};

// Middleware para garantir conexão antes de cada rota
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// 3. ROTAS REDUZIDAS (Teste apenas o Auth primeiro)
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => res.send('API Libras Salvador rodando... 🚀'));

// 4. EXPORTAÇÃO
module.exports = app;

// Local
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Local em ${PORT}`));
}