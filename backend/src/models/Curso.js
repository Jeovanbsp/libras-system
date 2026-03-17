const mongoose = require('mongoose');

const CursoSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  descricao: { type: String, required: true },
  cargaHoraria: { type: Number, required: true },
  nivel: { type: String, enum: ['Básico', 'Intermediário', 'Avançado'], default: 'Básico' },
  dataCriacao: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Curso', CursoSchema);