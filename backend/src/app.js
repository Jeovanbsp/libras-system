require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const connectDB = require('./config/db');

// IMPORTAÇÕES DE ROTAS
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
// 1. CONFIGURAÇÃO DE CORS (TOTALMENTE LIBERADO PARA TESTE)
// ==========================================
// Vamos liberar tudo (*) temporariamente para provar que o problema não é o código de CORS
app.use(cors({
  origin: true, 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

// Resposta rápida para o Preflight do navegador
app.options('*', cors());

// ==========================================
// 2. MIDDLEWARES DE PARSING
// ==========================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// 3. CONEXÃO COM BANCO (SEM BLOQUEAR O APP)
// ==========================================
connectDB().catch(err => {
  console.error("ERRO CRÍTICO NO MONGO:", err);
});

// ==========================================
// 4. ARQUIVOS ESTÁTICOS
// ==========================================
app.use('/uploads/materiais', express.static(path.join(__dirname, '../uploads/materiais')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ==========================================
// 5. REGISTRO DE ROTAS
// ==========================================
app.use('/api/auth', authRoutes);
app.use('/api/cursos', cursoRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api/financeiro', financeiroRoutes);
app.use('/api/materiais', materialRoutes);
app.use('/api/profissionais', profissionalRoutes); 
app.use('/api/b2b', clienteB2bRoutes);
app.use('/api/admin', adminRoutes); 

app.get('/', (req, res) => res.send('API Libras Salvador rodando... 🚀'));

// ROTA DE STATS
app.get('/api/stats', async (req, res) => {
  try {
    const User = require('./models/User');
    const Curso = require('./models/Curso');
    const Financeiro = require('./models/Financeiro');
    const ClienteB2B = require('./models/ClienteB2B');

    const [totalAlunos, totalCursos, transacoes] = await Promise.all([
      User.countDocuments({ role: 'aluno' }).catch(() => 0),
      Curso.countDocuments().catch(() => 0),
      Financeiro.find({ tipo: 'Entrada' }).catch(() => [])
    ]);
    
    let totalB2B = 0;
    try { totalB2B = await ClienteB2B.countDocuments(); } catch (e) {}

    const somaVendas = transacoes.reduce((acc, curr) => acc + (curr.valor || 0), 0);

    res.json({
      alunos: totalAlunos,
      cursos: totalCursos,
      clientesB2B: totalB2B,
      vendas: somaVendas.toFixed(2)
    });
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar estatísticas" });
  }
});

// ==========================================
// 6. EXPORTAÇÃO PARA VERCEL
// ==========================================
module.exports = app;

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`🚀 Servidor rodando localmente na porta ${PORT}`));
}