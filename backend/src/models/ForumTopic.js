const mongoose = require('mongoose');

const respostaSchema = new mongoose.Schema({
  autor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  texto: { type: String, required: true },
  mencoes: [{ type: String }],
  editada: { type: Boolean, default: false },
  dataCriacao: { type: Date, default: Date.now }
});

const forumTopicSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  conteudo: { type: String, required: true },
  autor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  categoria: { type: String, default: 'Geral' },
  respostas: [respostaSchema],
  mencoes: [{ type: String }],
  fixado: { type: Boolean, default: false },
  dataCriacao: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ForumTopic', forumTopicSchema);
