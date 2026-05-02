const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Material = require('../models/Material');

// Configuração do armazenamento do arquivo
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads/materiais/';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); // Cria a pasta se não existir
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // Gera um nome único: data atual + nome original
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// POST: Upload de arquivo e dados
router.post('/', upload.single('arquivo'), async (req, res) => {
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

// GET: Listar todos os materiais
router.get('/', async (req, res) => {
  try {
    const materiais = await Material.find().sort({ dataUpload: -1 });
    res.json(materiais);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar materiais" });
  }
});

// GET: Download arquivo
router.get('/download/:id', async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ error: "Material não encontrado" });
    }
    // Tenta múltiplos caminhos possíveis
    const possiblePaths = [
      path.join(__dirname, '../../uploads/materiais/', material.nomeArquivo),
      path.join(__dirname, '../uploads/materiais/', material.nomeArquivo),
      path.join(process.cwd(), 'uploads/materiais/', material.nomeArquivo)
    ];
    let caminho = possiblePaths.find(p => fs.existsSync(p));
    if (!caminho) {
      return res.status(404).json({ error: "Arquivo não encontrado no servidor" });
    }
    res.download(caminho);
  } catch (err) {
    console.error('Erro download:', err);
    res.status(500).json({ error: "Erro ao baixar arquivo" });
  }
});

// DELETE: Remover material e arquivo físico
router.delete('/:id', async (req, res) => {
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