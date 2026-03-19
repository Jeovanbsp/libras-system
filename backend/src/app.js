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
// MIDDLEWARES
// ==========================================
app.use(cors());
app.use(express.json());

// SERVIR ARQUIVOS ESTÁTICOS
// Esta linha é crucial para que o link de download funcione no painel do aluno
app.use('/uploads/materiais', express.static(path.join(__dirname, 'uploads/materiais')));
// Mantendo a rota geral de uploads caso use para fotos de perfil ou capas
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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

// ==========================================
// INICIALIZAÇÃO DO SERVIDOR
// ==========================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando com sucesso na porta ${PORT}`);
  console.log(`📅 Data: ${new Date().toLocaleDateString('pt-BR')}`);
});