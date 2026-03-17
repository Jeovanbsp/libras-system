const mongoose = require('mongoose');

const FinanceiroSchema = new mongoose.Schema({
  descricao: { type: String, required: true },
  valor: { type: Number, required: true },
  tipo: { type: String, enum: ['Entrada', 'Saída'], default: 'Entrada' },
  data: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Financeiro', FinanceiroSchema);