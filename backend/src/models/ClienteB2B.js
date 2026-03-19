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
  // AJUSTADO: De 'telefone' para 'whatsapp' para sincronizar com o Frontend
  whatsapp: {
    type: String
  },
  // Para sabermos que tipo de serviço esta empresa costuma pedir
  servicosInteresse: [{
    type: String
    // Removido o enum para evitar erros de validação estritos
  }],
  // NOVO: Campo para observações do contrato ou empresa
  observacoes: {
    type: String
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