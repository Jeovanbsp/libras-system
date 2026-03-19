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
const apostilaRoutes = require('./routes/apostilaRoutes');
const vendaRoutes = require('./routes/vendaRoutes');

const app = express();

// ==========================================
// 1. CONFIGURAÇÃO DE CORS (PRIMEIRO DE TUDO)
// ==========================================
app.use(cors({
  origin: ["https://librasalvador.vercel.app", "http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
  credentials: true
}));

// CORREÇÃO EXPRESS 5: Substituído '*' por '(.*)' para evitar o PathError
app.options('(.*)', cors());

// ==========================================
// 2. MIDDLEWARES DE PARSING
// ==========================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// 3. CONEXÃO COM BANCO (ASSÍNCRONA)
// ==========================================
connectDB().catch(err => console.error("Erro na conexão inicial do Mongo:", err));

// ==========================================
// 4. SERVIR ARQUIVOS ESTÁTICOS
// ==========================================
app.use('/uploads/materiais', express.static(path.join(__dirname, '../uploads/materiais')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ==========================================
// 5. REGISTRO DE ROTAS DA API
// ==========================================
app.use('/api/auth', authRoutes);
app.use('/api/cursos', cursoRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api/financeiro', financeiroRoutes);
app.use('/api/materiais', materialRoutes);
app.use('/api/profissionais', profissionalRoutes); 
app.use('/api/b2b', clienteB2bRoutes);
app.use('/api/admin', adminRoutes); 
app.use('/api/apostilas', apostilaRoutes);
app.use('/api/vendas', vendaRoutes);

// Rota de teste para confirmar que a API está online
app.get('/', (req, res) => res.send('API Libras Salvador rodando... 🚀'));

// ==========================================
// 6. ROTA DE ESTATÍSTICAS (OTIMIZADA)
// ==========================================
app.get('/api/stats', async (req, res) => {
  try {
    const User = require('./models/User');
    const Curso = require('./models/Curso');
    const Financeiro = require('./models/Financeiro');
    const ClienteB2B = require('./models/ClienteB2B');

    const [totalAlunos, totalCursos, transacoes, totalB2B] = await Promise.all([
      User.countDocuments({ role: 'aluno' }).catch(() => 0),
      Curso.countDocuments().catch(() => 0),
      Financeiro.find({ tipo: 'Entrada' }).catch(() => []),
      ClienteB2B.countDocuments().catch(() => 0)
    ]);

    const somaVendas = transacoes.reduce((acc, curr) => acc + (curr.valor || 0), 0);

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

// ==========================================
// 7. EXPORTAÇÃO PARA AMBIENTES SERVERLESS / RENDER
// ==========================================
module.exports = app;

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando localmente na porta ${PORT}`);
  });
} else {
  // No Render (produção), precisamos que o app escute a porta
  app.listen(PORT, () => {
    console.log(`🚀 Servidor de produção rodando na porta ${PORT}`);
  });
}