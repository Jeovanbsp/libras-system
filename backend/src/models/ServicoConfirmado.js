const mongoose = require('mongoose');

const servicoConfirmadoSchema = new mongoose.Schema({
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClienteB2B',
    required: [true, 'O cliente é obrigatório']
  },
  interpretes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profissional'
  }],
  dataEvento: {
    type: Date,
    required: [true, 'A data do evento é obrigatória']
  },
  quantidadeHoras: {
    type: Number,
    required: [true, 'A quantidade de horas é obrigatória']
  },
  tipoEvento: {
    type: String,
    enum: ['Conferência', 'Social', 'Artístico e Cultural', 'Contextos Empresariais', 'Outros'],
    required: [true, 'O tipo de evento é obrigatório']
  },
  modalidade: {
    type: String,
    enum: ['Virtual', 'Presencial'],
    required: [true, 'A modalidade é obrigatória']
  },
  // Módulo Financeiro embutido no serviço
  precoTotal: { type: Number, required: true, default: 0 },
  valorLogistica: { type: Number, default: 0 },
  impostos: { type: Number, default: 0 },
  valorInterpretes: { type: Number, default: 0 },
  caixaEmpresa: { type: Number, default: 0 },
  
  observacoes: { type: String },
  dataCadastro: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('ServicoConfirmado', servicoConfirmadoSchema);