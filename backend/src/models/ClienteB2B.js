const mongoose = require('mongoose');

const clienteB2bSchema = new mongoose.Schema({
  razaoSocial: {
    type: String,
    required: [true, 'A Razão Social é obrigatória']
  },
  cnpj: {
    type: String,
    required: [true, 'O CNPJ é obrigatório'],
    unique: true
  },
  nomeContato: {
    type: String,
    required: [true, 'O nome da pessoa de contacto é obrigatório']
  },
  email: {
    type: String,
    required: [true, 'O e-mail de contacto é obrigatório'],
    lowercase: true
  },
  telefone: {
    type: String
  },
  // Para sabermos que tipo de serviço esta empresa costuma pedir
  servicosInteresse: [{
    type: String,
    enum: ['Eventos Presenciais', 'Eventos Virtuais', 'Tradução Audiovisual', 'Legendagem', 'Consultoria'],
  }],
  status: {
    type: String,
    enum: ['Ativo', 'Inativo', 'Prospeto'],
    default: 'Ativo'
  },
  dataCadastro: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ClienteB2B', clienteB2bSchema);