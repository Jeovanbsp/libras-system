const mongoose = require('mongoose');

const forumMessageSchema = new mongoose.Schema({
    curso: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Curso', 
        required: true 
    },
    autor: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    texto: { 
        type: String, 
        default: '' 
    },
    imagem: { 
        type: String, 
        default: null 
    },
    editada: { 
        type: Boolean, 
        default: false 
    },
    dataCriacao: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('ForumMessage', forumMessageSchema);
