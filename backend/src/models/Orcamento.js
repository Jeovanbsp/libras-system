const mongoose = require('mongoose');

const OrcamentoSchema = new mongoose.Schema({
  cliente: String,
  servico: String,
  valores: {
    horas: Number,
    valorHora: Number,
    logistica: Number,
    material: Number,
    imposto: Number, // ex: 0.10
    margem: Number,  // ex: 0.20
    valorFinal: Number
  },
  dataCriacao: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Orcamento', OrcamentoSchema);