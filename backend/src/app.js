require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Importações
const authRoutes = require('./routes/auth');
const cursoRoutes = require('./routes/cursoRoutes');
const userRoutes = require('./routes/userRoutes');
const financeiroRoutes = require('./routes/financeiroRoutes');
const materialRoutes = require('./routes/materialRoutes');

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

// SERVIR ARQUIVOS ESTÁTICOS (Permite abrir o PDF pelo link)
// Se o app.js estiver dentro de /src, usamos o path abaixo:
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rotas API
app.use('/api/auth', authRoutes);
app.use('/api/cursos', cursoRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api/financeiro', financeiroRoutes);
app.use('/api/materiais', materialRoutes);

// Rota de Stats (Dashboard)
app.get('/api/stats', async (req, res) => {
  const totalAlunos = await require('./models/User').countDocuments();
  const totalCursos = await require('./models/Curso').countDocuments();
  const transacoes = await require('./models/Financeiro').find({ tipo: 'Entrada' });
  const somaVendas = transacoes.reduce((acc, curr) => acc + curr.valor, 0);

  res.json({
    alunos: totalAlunos,
    cursos: totalCursos,
    vendas: somaVendas.toFixed(2)
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor na porta ${PORT}`));