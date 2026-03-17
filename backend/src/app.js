require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Importações de Rotas
const authRoutes = require('./routes/auth');
const cursoRoutes = require('./routes/cursoRoutes');
const userRoutes = require('./routes/userRoutes');
const financeiroRoutes = require('./routes/financeiroRoutes');
const materialRoutes = require('./routes/materialRoutes');
const profissionalRoutes = require('./routes/profissionalRoutes'); 
const clienteB2bRoutes = require('./routes/clienteB2bRoutes'); // Nova Rota B2B

const app = express();

// Conexão com Banco de Dados
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos (PDFs, imagens, etc)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rotas API
app.use('/api/auth', authRoutes);
app.use('/api/cursos', cursoRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api/financeiro', financeiroRoutes);
app.use('/api/materiais', materialRoutes);
app.use('/api/profissionais', profissionalRoutes); 
app.use('/api/b2b', clienteB2bRoutes); // Registro da nova rota B2B

// Rota de Stats (Dashboard)
app.get('/api/stats', async (req, res) => {
  try {
    const totalAlunos = await require('./models/User').countDocuments({ role: 'aluno' });
    const totalCursos = await require('./models/Curso').countDocuments();
    
    // Tentativa de contar clientes B2B (Se o model já existir)
    let totalB2B = 0;
    try {
      totalB2B = await require('./models/ClienteB2B').countDocuments();
    } catch (e) {
      console.log("Model B2B ainda não carregado nas stats.");
    }

    const transacoes = await require('./models/Financeiro').find({ tipo: 'Entrada' });
    const somaVendas = transacoes.reduce((acc, curr) => acc + curr.valor, 0);

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));