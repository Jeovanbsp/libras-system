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

// POST: Adicionar novo certificado para um aluno
router.post('/:alunoId', upload.single('certificado'), async (req, res) => {
  try {
    const { alunoId } = req.params;
    const { nomeCertificado } = req.body;
    const aluno = await User.findById(alunoId);
    
    if (!aluno) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }
    
    // Adiciona novo certificado ao array
    const novoCertificado = {
      nome: nomeCertificado || `Certificado ${(aluno.certificados?.length || 0) + 1}`,
      arquivo: req.file.filename,
      dataUpload: new Date()
    };
    
    if (!aluno.certificados) {
      aluno.certificados = [];
    }
    aluno.certificados.push(novoCertificado);
    await aluno.save();
    
    res.json({ 
      message: 'Certificado adicionado com sucesso',
      certificado: novoCertificado,
      total: aluno.certificados.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao fazer upload do certificado' });
  }
});

// GET: Listar todos os certificados de um aluno
router.get('/:alunoId', async (req, res) => {
  try {
    const { alunoId } = req.params;
    const aluno = await User.findById(alunoId);
    
    if (!aluno) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }
    
    res.json({ 
      certificados: aluno.certificados || [],
      total: aluno.certificados?.length || 0
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar certificados' });
  }
});

// DELETE: Remover um certificado específico
router.delete('/:alunoId/:certificadoIndex', async (req, res) => {
  try {
    const { alunoId, certificadoIndex } = req.params;
    const aluno = await User.findById(alunoId);
    
    if (!aluno) {
      return res.status(404).json({ error: 'Aluno não encontrado' });
    }
    
    if (!aluno.certificados || !aluno.certificados[certificadoIndex]) {
      return res.status(404).json({ error: 'Certificado não encontrado' });
    }
    
    // Remove arquivo físico
    const arquivo = aluno.certificados[certificadoIndex].arquivo;
    const caminhoArquivo = path.join(__dirname, '../../uploads/certificados/', arquivo);
    if (fs.existsSync(caminhoArquivo)) {
      fs.unlinkSync(caminhoArquivo);
    }
    
    // Remove do array
    aluno.certificados.splice(certificadoIndex, 1);
    await aluno.save();
    
    res.json({ message: 'Certificado removido com sucesso', total: aluno.certificados.length });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao remover certificado' });
  }
});

module.exports = router;