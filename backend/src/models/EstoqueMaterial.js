const mongoose = require('mongoose');

const estoqueMaterialSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: [true, 'O nome do material é obrigatório']
  },
  tipo: {
    type: String,
    enum: ['Material Didático', 'Camisa', 'Acessório', 'Outro'],
    default: 'Material Didático'
  },
  quantidade: {
    type: Number,
    required: [true, 'A quantidade em stock é obrigatória'],
    default: 0
  },
  precoCusto: {
    type: Number,
    default: 0
  },
  precoVenda: {
    type: Number,
    default: 0
  },
  tamanho: {
    type: String // Útil para diferenciar tamanhos de camisas, caso necessário
  },
  observacoes: {
    type: String
  },
  dataCadastro: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('EstoqueMaterial', estoqueMaterialSchema);