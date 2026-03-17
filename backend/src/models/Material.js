const mongoose = require('mongoose');

const MaterialSchema = new mongoose.Schema({
  titulo: { 
    type: String, 
    required: true 
  },
  descricao: { 
    type: String 
  },
  nomeArquivo: { 
    type: String, 
    required: true 
  },
  caminho: { 
    type: String, 
    required: true 
  },
  dataUpload: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Material', MaterialSchema);