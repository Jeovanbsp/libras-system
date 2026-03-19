const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Garante que a pasta de materiais existe
const dir = './uploads/materiais';
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        // Nome: timestamp-nome_original.pdf
        const uniqueName = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
        cb(null, uniqueName);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 20 * 1024 * 1024 } // Aumentei para 20MB para PDFs maiores
});

module.exports = upload;