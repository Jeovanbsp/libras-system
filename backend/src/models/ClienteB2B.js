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
  whatsapp: {
    type: String
  },
  servicosInteresse: [{
    type: String
  }],
  observacoes: {
    type: String
  },
  // NOVO CAMPO: Preço por hora praticado para este cliente
  precoHora: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    default: 'Prospeto'
  },
  dataCadastro: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ClienteB2B', clienteB2bSchema);