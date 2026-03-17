const mongoose = require('mongoose');

// Estrutura de uma Aula Individual
const aulaSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  descricao: { type: String },
  duracao: { type: Number }, // Tempo em minutos
  videoUrl: { type: String }, // Link do YouTube/Vimeo
  material: { type: String }, // Caminho do arquivo PDF extra, se houver
  concluida: { type: Boolean, default: false } // Status da aula
});

// Estrutura de um Módulo (que contém várias aulas)
const moduloSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  aulas: [aulaSchema] // Array de aulas dentro deste módulo
});

// Estrutura Principal do Curso
const cursoSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  descricao: { type: String, required: true },
  cargaHoraria: { type: Number, required: true },
  nivel: { type: String, default: 'Básico' },
  
  // A MÁGICA ACONTECE AQUI:
  modulos: [moduloSchema], 

  dataCriacao: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Curso', cursoSchema);