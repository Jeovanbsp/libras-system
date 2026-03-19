const mongoose = require('mongoose');

const aulaSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  descricao: { type: String },
  duracao: { type: Number },
  videoUrl: { type: String },
  material: { type: String }
});

const moduloSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  aulas: [aulaSchema]
});

const cursoSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  descricao: { type: String, required: true },
  cargaHoraria: { type: Number, required: true },
  nivel: { type: String, default: 'Básico' },
  // Campos de controle de acesso
  gratuito: { type: Boolean, default: false },
  valor: { type: Number, default: 0 },
  
  modulos: [moduloSchema], 
  dataCriacao: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Curso', cursoSchema);