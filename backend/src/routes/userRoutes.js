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
