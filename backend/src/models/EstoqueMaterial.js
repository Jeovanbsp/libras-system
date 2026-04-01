const mongoose = require('mongoose');

// Sub-esquema para registar cada venda feita
const vendaSchema = new mongoose.Schema({
  quantidade: { type: Number, required: true },
  valorTotal: { type: Number, required: true },
  data: { type: Date, default: Date.now }
});

const estoqueSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  tipo: { type: String, required: true },
  tamanho: { type: String },
  quantidade: { type: Number, required: true, default: 0 },
  precoCusto: { type: Number, default: 0 },
  precoVenda: { type: Number, default: 0 },
  observacoes: { type: String },
  historicoVendas: [vendaSchema], // NOVO: Guarda todas as vendas deste artigo
  dataCadastro: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('EstoqueMaterial', estoqueSchema);