const mongoose = require('mongoose');

const FinanceiroSchema = new mongoose.Schema({
  descricao: { type: String, required: true },
  valor: { type: Number, required: true },
  tipo: { type: String, enum: ['Entrada', 'Saída'], default: 'Entrada' },
  data: { type: Date, default: Date.now },
  // Adicionar status ajuda no controle de inadimplência ou agendamentos
  status: { 
    type: String, 
    enum: ['Pendente', 'Pago', 'Cancelado'], 
    default: 'Pago' 
  }
}, { timestamps: true }); // Timestamps ajudam a saber quando o registro foi criado/editado

module.exports = mongoose.model('Financeiro', FinanceiroSchema);