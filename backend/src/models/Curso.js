const mongoose = require('mongoose');

const aulaSchema = new mongoose.Schema({
  titulo: { type: String, required: true }, // Se existir aula, o titulo é obrigatório
  descricao: { type: String },
  duracao: { type: Number },
  videoUrl: { type: String },
  material: { type: String }
});

const moduloSchema = new mongoose.Schema({
  titulo: { type: String, required: true }, // Se existir módulo, o titulo é obrigatório
  aulas: [aulaSchema] // Array de aulas
});

const cursoSchema = new mongoose.Schema({
  titulo: { type: String, required: true }, // Obrigatório
  descricao: { type: String, required: true }, // Obrigatório
  cargaHoraria: { type: Number, required: true }, // Obrigatório
  nivel: { type: String, default: 'curso' },
  gratuito: { type: Boolean, default: false },
  valor: { type: Number, default: 0 },
  
  // O array de módulos NÃO DEVE ter "required: true", assim ele aceita [] (vazio)
  modulos: [moduloSchema], 
  
  dataCriacao: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Curso', cursoSchema);