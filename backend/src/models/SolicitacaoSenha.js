const mongoose = require('mongoose');

const SolicitacaoSenhaSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  email: {
    type: String,
    required: true
  },
  novaSenha: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pendente', 'aprovada', 'rejeitada'],
    default: 'pendente'
  },
  dataSolicitacao: {
    type: Date,
    default: Date.now
  },
  dataResposta: {
    type: Date
  },
  respondidoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

module.exports = mongoose.model('SolicitacaoSenha', SolicitacaoSenhaSchema);
