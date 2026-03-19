require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// ==========================================
// IMPORTAÇÕES DE ROTAS
// ==========================================
const authRoutes = require('./routes/auth');
const cursoRoutes = require('./routes/cursoRoutes');
const userRoutes = require('./routes/userRoutes');
const financeiroRoutes = require('./routes/financeiroRoutes');
const materialRoutes = require('./routes/materialRoutes');
const profissionalRoutes = require('./routes/profissionalRoutes'); 
const clienteB2bRoutes = require('./routes/clienteB2bRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// ==========================================
// CONEXÃO COM BANCO DE DATOS
// ==========================================
connectDB();

// ==========================================
// MIDDLEWARES & CORS CONFIG
// ==========================================
// Ajustado para permitir o seu novo domínio na Vercel
app.use(cors({
  origin: [
    'https://librasalvador.vercel.app', 
    'http://localhost:5173', 
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// SERVIR ARQUIVOS ESTÁTICOS
// Nota: Na Vercel, o sistema de arquivos é somente leitura. 
// Para que os materiais apareçam, eles precisam estar no seu repositório Git.
app.use('/uploads/materiais', express.static(path.join(__dirname, 'uploads/materiais')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ==========================================
// REGISTRO DE ROTAS DA API
// ==========================================
app.use('/api/auth', authRoutes);
app.use('/api/cursos', cursoRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api/financeiro', financeiroRoutes);
app.use('/api/materiais', materialRoutes);
app.use('/api/profissionais', profissionalRoutes); 
app.use('/api/b2b', clienteB2bRoutes);
app.use('/api/admin', adminRoutes); 

// Rota base para teste de fôlego do servidor
app.get('/', (req, res) => res.send('API Libras Salvador rodando... 🚀'));

// ==========================================
// ROTA DE ESTATÍSTICAS (DASHBOARD)
// ==========================================
app.get('/api/stats', async (req, res) => {
  try {
    const User = require('./models/User');
    const Curso = require('./models/Curso');
    const Financeiro = require('./models/Financeiro');
    const ClienteB2B = require('./models/ClienteB2B');

    const totalAlunos = await User.countDocuments({ role: 'aluno' });
    const totalCursos = await Curso.countDocuments();
    
    let totalB2B = 0;
    try {
      totalB2B = await ClienteB2B.countDocuments();
    } catch (e) {
      console.log("Model B2B ainda não carregado.");
    }

    const transacoes = await Financeiro.find({ tipo: 'Entrada' });
    const somaVendas = transacoes.reduce((acc, curr) => acc + curr.valor, 0);

    res.json({
      alunos: totalAlunos,
      cursos: totalCursos,
      clientesB2B: totalB2B,
      vendas: somaVendas.toFixed(2)
    });
  } catch (error) {
    console.error("Erro ao carregar stats:", error);
    res.status(500).json({ message: "Erro ao buscar estatísticas" });
  }
});

// Exportação necessária para o Vercel Serverless
module.exports = app;

// INICIALIZAÇÃO LOCAL (O Vercel ignora o app.listen, mas você precisa dele para rodar no seu PC)
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando localmente na porta ${PORT}`);
  });
}