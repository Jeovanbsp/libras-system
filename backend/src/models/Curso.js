const mongoose = require('mongoose');

// Nova estrutura: cada aula pode ter VÁRIOS materiais (vídeos, links, pdfs, etc)
const materialSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  tipo: { type: String, enum: ['video', 'link', 'pdf', 'texto'], required: true },
  url: { type: String, required: true }
});

const aulaSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  descricao: { type: String },  // Descrição breve da atividade
  duracao: { type: Number },
  materiais: [materialSchema]
});

const moduloSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  aulas: [aulaSchema]
});

const cursoSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  descricao: { type: String, required: true },
  cargaHoraria: { type: Number, required: true },
  nivel: { type: String, default: 'curso' },
  gratuito: { type: Boolean, default: false },
  valor: { type: Number, default: 0 },
  modulos: [moduloSchema],
  dataCriacao: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Curso', cursoSchema);