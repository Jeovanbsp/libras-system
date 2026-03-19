const mongoose = require('mongoose');

const profissionalSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: [true, 'O nome é obrigatório']
  },
  email: {
    type: String,
    required: [true, 'O e-mail é obrigatório'],
    unique: true,
    lowercase: true
  },
  // AJUSTADO: Mudamos de 'telefone' para 'whatsapp' para bater com o Frontend
  whatsapp: {
    type: String
  },
  especialidades: [{
    type: String,
    // Removi o enum estrito para evitar erros de validação caso mude o nome no front
    default: 'Educação'
  }],
  // NOVO: Campo para as observações que adicionamos
  observacoes: {
    type: String
  },
  valorHora: {
    type: Number,
    required: [true, 'O valor da hora é necessário']
  },
  // Campos opcionais mantidos para compatibilidade
  disponibilidade: {
    type: String, 
    default: 'Integral'
  },
  ativo: {
    type: Boolean,
    default: true
  },
  dataCadastro: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Profissional', profissionalSchema);