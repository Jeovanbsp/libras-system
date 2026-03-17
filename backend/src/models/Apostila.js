const mongoose = require('mongoose');

const ApostilaSchema = new mongoose.Schema({
  titulo: { type: String, required: true }, // Ex: "Libras Básico"
  versao: { type: String, required: true }, // Ex: "2024 v1"
  tipo: { type: String, enum: ['Digital', 'Física'], required: true },
  custoProducao: { type: Number, default: 0 },
  precoVenda: { type: Number, required: true },
  estoque: { type: Number, default: 0 }, // Para físicas
  urlDownload: String, // Link para o PDF se for digital
  dataAtualizacao: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Apostila', ApostilaSchema);