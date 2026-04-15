const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Material = require('../models/Material');
const auth = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');

// Allowed file extensions for upload
const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.png', '.jpg', '.jpeg', '.gif', '.mp4', '.mp3'];

// Configuração do armazenamento do arquivo
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads/';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // Sanitize filename: remove path traversal characters and use only the base name
    const safeName = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, Date.now() + '-' + safeName);
  }
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_EXTENSIONS.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não permitido. Extensões aceitas: ' + ALLOWED_EXTENSIONS.join(', ')), false);
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 20 * 1024 * 1024 } });

// POST: Upload de arquivo e dados - admin only
router.post('/', auth, authorizeRoles('admin', 'admin_restrito'), upload.single('arquivo'), async (req, res) => {
  try {
    const { titulo, descricao } = req.body;
    const novoMaterial = new Material({
      titulo,
      descricao,
      nomeArquivo: req.file.filename,
      caminho: req.file.path.replace(/\\/g, "/") // Normaliza barras para Windows/Linux
    });
    await novoMaterial.save();
    res.status(201).json(novoMaterial);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao processar upload" });
  }
});

// GET: Listar todos os materiais - authenticated users
router.get('/', auth, async (req, res) => {
  try {
    const materiais = await Material.find().sort({ dataUpload: -1 });
    res.json(materiais);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar materiais" });
  }
});

// DELETE: Remover material e arquivo físico - admin only
router.delete('/:id', auth, authorizeRoles('admin'), async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (material && fs.existsSync(material.caminho)) {
      fs.unlinkSync(material.caminho); // Apaga o arquivo da pasta
    }
    await Material.findByIdAndDelete(req.params.id);
    res.json({ msg: "Removido com sucesso" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao remover" });
  }
});

module.exports = router;
