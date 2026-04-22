const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');

// Configuração do armazenamento do arquivo
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads/certificados/';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = /pdf|jpg|jpeg|png/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.test(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Apenas PDF, JPG ou PNG são permitidos'));
    }
  }
});

// POST: Upload certificado para um aluno específico
router.post('/:alunoId', upload.single('certificado'), async (req, res) => {
  try {
    const { alunoId } = req.params;
    const aluno = await User.findById(alunoId);
    
    if (!aluno) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }
    
    // Remove certificado anterior se existir
    if (aluno.certificado) {
      const caminhoAntigo = path.join(__dirname, '../../uploads/certificados/', aluno.certificado);
      if (fs.existsSync(caminhoAntigo)) {
        fs.unlinkSync(caminhoAntigo);
      }
    }
    
    // Salva o caminho do certificado
    const nomeArquivo = req.file.filename;
    aluno.certificado = nomeArquivo;
    await aluno.save();
    
    res.json({ 
      message: 'Certificado enviado com sucesso',
      certificado: nomeArquivo,
      aluno: aluno.nome
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao fazer upload do certificado' });
  }
});

// GET: Ver certificado de um aluno
router.get('/:alunoId', async (req, res) => {
  try {
    const { alunoId } = req.params;
    const aluno = await User.findById(alunoId);
    
    if (!aluno) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }
    
    if (!aluno.certificado) {
      return res.json({ certificado: null, message: 'Nenhum certificado encontrado' });
    }
    
    res.json({ 
      certificado: aluno.certificado,
      aluno: aluno.nome
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar certificado' });
  }
});

// DELETE: Remover certificado de um aluno
router.delete('/:alunoId', async (req, res) => {
  try {
    const { alunoId } = req.params;
    const aluno = await User.findById(alunoId);
    
    if (!aluno) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }
    
    if (aluno.certificado) {
      const caminhoArquivo = path.join(__dirname, '../../uploads/certificados/', aluno.certificado);
      if (fs.existsSync(caminhoArquivo)) {
        fs.unlinkSync(caminhoArquivo);
      }
      aluno.certificado = '';
      await aluno.save();
    }
    
    res.json({ message: 'Certificado removido com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao remover certificado' });
  }
});

module.exports = router;