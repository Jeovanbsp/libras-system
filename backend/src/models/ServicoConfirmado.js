const mongoose = require('mongoose');

const servicoConfirmadoSchema = new mongoose.Schema({
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClienteB2B',
    required: [true, 'O cliente é obrigatório']
  },
  solicitante: {
    type: String, // Referente à coluna "Pessoa solicitante" da planilha
  },
  interpretes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profissional'
  }],
  dataEvento: {
    type: Date,
    required: [true, 'A data inicial do evento é obrigatória']
  },
  dataFim: {
    type: Date, // Referente à coluna "Dia Final"
  },
  horaInicio: {
    type: String, // Referente à coluna "Hora de início"
  },
  horaTermino: {
    type: String, // Referente à coluna "Hora de témino"
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
  // Módulo Financeiro embutido
  precoTotal: { type: Number, required: true, default: 0 },
  valorLogistica: { type: Number, default: 0 },
  impostos: { type: Number, default: 0 },
  valorInterpretes: { type: Number, default: 0 },
  caixaEmpresa: { type: Number, default: 0 },
  statusPagamento: { 
    type: String, 
    enum: ['Pendente', 'Pago'], 
    default: 'Pendente' 
  },
  
  observacoes: { type: String },
  dataCadastro: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('ServicoConfirmado', servicoConfirmadoSchema);