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
  whatsapp: {
    type: String
  },
  // NOVOS CAMPOS ADICIONADOS
  cpf: { type: String },
  rg: { type: String },
  pix: { type: String },
  
  especialidades: [{
    type: String,
    default: 'Educação'
  }],
  observacoes: {
    type: String
  },
  valorHora: {
    type: Number,
    required: [true, 'O valor da hora é necessário']
  },
  // ATUALIZADO: Controle restrito de disponibilidade
  disponibilidade: {
    type: String, 
    enum: ['Manhãs', 'Tardes', 'Noites', 'Integral'],
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