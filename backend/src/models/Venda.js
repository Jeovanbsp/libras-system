const mongoose = require('mongoose');

const VendaSchema = new mongoose.Schema({
  alunoId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cursoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Curso', required: true },
  apostilaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Apostila' }, // Opcional
  
  dataVenda: { type: Date, default: Date.now },
  statusPagamento: { 
    type: String, 
    enum: ['Pendente', 'Confirmado', 'Cancelado'], 
    default: 'Pendente' 
  },
  
  valorBruto: Number,
  descontoAplicado: { type: Number, default: 0 },
  valorFinal: Number
});

module.exports = mongoose.model('Venda', VendaSchema);