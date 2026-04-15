const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middlewares/authMiddleware');

// GET: Listar todos os usuários (Alunos/Professores)
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Busca todos os usuários, mas não envia a senha por segurança
    const usuarios = await User.find().select('-password');
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar usuários" });
  }
});

// PUT: Atualizar nome e email de um usuário (Admin)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { nome, email } = req.body;
    const userRole = req.user?.role;
    
    if (userRole !== 'admin' && userRole !== 'admin_restrito') {
      return res.status(403).json({ error: "Acesso negado." });
    }

    // admin_restrito só pode editar alunos
    if (userRole === 'admin_restrito') {
      const alvo = await User.findById(req.params.id).select('role');
      if (!alvo) return res.status(404).json({ error: "Usuário não encontrado." });
      if (alvo.role === 'admin' || alvo.role === 'admin_restrito') {
        return res.status(403).json({ error: "Você não tem permissão para editar este usuário." });
      }
    }

    const updateData = {};
    if (nome) updateData.nome = nome;
    if (email) {
      const existente = await User.findOne({ email, _id: { $ne: req.params.id } });
      if (existente) return res.status(400).json({ error: "Este e-mail já está em uso por outro usuário." });
      updateData.email = email;
    }

    const usuario = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password');
    if (!usuario) return res.status(404).json({ error: "Usuário não encontrado." });
    
    res.json(usuario);
  } catch (err) {
    res.status(500).json({ error: "Erro ao atualizar usuário." });
  }
});

// DELETE: Remover um usuário (Opcional, mas útil)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ msg: "Usuário removido com sucesso" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao remover usuário" });
  }
});

module.exports = router;
