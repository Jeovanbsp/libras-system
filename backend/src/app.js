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
const servicoConfirmadoRoutes = require('./routes/servicoConfirmadoRoutes');
const estoqueRoutes = require('./routes/estoqueRoutes');
const empresaSolicitanteRoutes = require('./routes/empresaSolicitanteRoutes');

const app = express();

// ==========================================
// 1. CONFIGURAÇÃO DE CORS
// ==========================================
app.use(cors({
  origin: ["https://librasalvador.vercel.app", "http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
  credentials: true
}));

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
// Registre as rotas mais específicas primeiro
app.use('/api/empresas-solicitantes', empresaSolicitanteRoutes); 
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
app.use('/api/servicos', servicoConfirmadoRoutes);
app.use('/api/estoque', estoqueRoutes);

// Rota de Stats
app.get('/api/stats', async (req, res) => {
  // ... seu código de stats (mantenha como está)
});

// Rota raiz (Deixe por último entre as rotas da API)
app.get('/', (req, res) => res.send('API Libras Salvador rodando... 🚀'));

// ==========================================
// 6. TRATAMENTO DE ERRO 404 (OPCIONAL)
// ==========================================
// Se chegar aqui, nenhuma rota acima capturou a requisição
app.use((req, res) => {
  res.status(404).json({ error: `Rota ${req.originalUrl} não encontrada no servidor.` });
});

// ==========================================
// 7. EXPORTAÇÃO E INICIALIZAÇÃO
// ==========================================
const PORT = process.env.PORT || 3000;

// No Render, é melhor deixar o listen rodar sempre, 
// o ambiente gerencia as portas automaticamente.
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});

module.exports = app;