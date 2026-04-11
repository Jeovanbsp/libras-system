const mongoose = require('mongoose');

const FinanceiroSchema = new mongoose.Schema({
  descricao: { type: String, required: true },
  valor: { type: Number, required: true },
  tipo: { type: String, enum: ['Entrada', 'Saída'], default: 'Entrada' },
  data: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['Pendente', 'Pago', 'Cancelado'], 
    default: 'Pago' 
  },
  // Vínculo para atualizar/deletar o registo financeiro se o serviço mudar
  servicoOrigem: { type: mongoose.Schema.Types.ObjectId, ref: 'ServicoConfirmado' }
}, { timestamps: true });

module.exports = mongoose.model('Financeiro', FinanceiroSchema);