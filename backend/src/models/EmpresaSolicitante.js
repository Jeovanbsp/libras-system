const mongoose = require('mongoose');

const empresaSolicitanteSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, 'Nome da empresa é obrigatório'],
      unique: true,
      trim: true,
      minlength: [3, 'Nome deve ter no mínimo 3 caracteres'],
      maxlength: [100, 'Nome não pode exceder 100 caracteres']
    },
    sigla: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: [10, 'Sigla não pode exceder 10 caracteres']
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    telefone: {
      type: String,
      trim: true
    },
    endereco: {
      type: String,
      trim: true
    },
    contato: {
      type: String,
      trim: true
    },
    ativo: {
      type: Boolean,
      default: true
    },
    descricao: {
      type: String,
      trim: true
    },
    criadoEm: {
      type: Date,
      default: Date.now
    },
    atualizadoEm: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true, collection: 'empresas_solicitantes' }
);

// Índices
empresaSolicitanteSchema.index({ nome: 1 });
empresaSolicitanteSchema.index({ ativo: 1 });

module.exports = mongoose.model('EmpresaSolicitante', empresaSolicitanteSchema);