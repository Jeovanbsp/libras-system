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
  telefone: {
    type: String
  },
  // Especialidades mencionadas no escopo
  especialidades: [{
    type: String,
    enum: ['Jurídico', 'Saúde', 'Eventos', 'Educação', 'Corporativo', 'Audiovisual'],
    default: 'Educação'
  }],
  // Certificações importantes para o Módulo A
  certificacoes: [{
    type: String,
    enum: ['Prolibras', 'CAS', 'Bacharelado', 'Pós-Graduação'],
  }],
  valorHora: {
    type: Number,
    required: [true, 'O valor da hora é necessário para cálculos financeiros']
  },
  disponibilidade: {
    type: String, // Pode ser "Manhã", "Tarde", "Noite", "Integral"
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