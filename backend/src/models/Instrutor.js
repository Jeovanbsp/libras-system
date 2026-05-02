const mongoose = require('mongoose');

const instrutorSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  telefone: { type: String },
  especialidade: { type: String },
  cpf: { type: String },
  biografia: { type: String },
  ativo: { type: Boolean, default: true },
  // Cursos que o professor pode gerenciar
  cursos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Curso' }],
}, { timestamps: true });

module.exports = mongoose.model('Instrutor', instrutorSchema);