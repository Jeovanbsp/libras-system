const express = require('express');
const router = express.Router();
const User = require('../models/User');
const SolicitacaoSenha = require('../models/SolicitacaoSenha');
const authMiddleware = require('../middlewares/authMiddleware');

// GET: Total pago por todos os alunos
router.get('/total-pago', authMiddleware, async (req, res) => {
  try {
    const resultado = await User.aggregate([
      { $match: { role: 'aluno' } },
      { $group: { _id: null, total: { $sum: '$valorPago' } } }
    ]);
    res.json({ total: resultado[0]?.total || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: Listar todos os usuários (Alunos/Professores)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { busca, turma, modalidade, dataInicio, dataFim } = req.query;
    let filtro = {};

    if (busca) {
      filtro.$or = [
        { nome: { $regex: new RegExp(busca, 'i') } },
        { email: { $regex: new RegExp(busca, 'i') } }
      ];
    }
    if (turma) filtro.turma = { $regex: new RegExp(turma, 'i') };
    if (modalidade) filtro.modalidade = modalidade;
    
    if (dataInicio || dataFim) {
      filtro.createdAt = {};
      if (dataInicio) filtro.createdAt.$gte = new Date(dataInicio);
      if (dataFim) {
        let fim = new Date(dataFim);
        fim.setHours(23, 59, 59, 999);
        filtro.createdAt.$lte = fim;
      }
    }

    const usuarios = await User.find(filtro).select('-password');
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar usuários" });
  }
});

// GET: Buscar usuário por ID (para aluno ver seus próprios dados)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await User.findById(id).select('-password');
    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    res.json(usuario);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
});

// PUT: Atualizar usuário completo (Admin)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { nome, email, password, statusPagamento, modalidade, valorTotalCurso, valorPago, apostila, combo, turma } = req.body;
    const userRole = req.user?.role;
    
    if (userRole !== 'admin' && userRole !== 'admin_restrito') {
      return res.status(403).json({ error: "Acesso negado." });
    }

    // admin_restrito só pode editar alunos (não admin, não professor, não admin_restrito)
    if (userRole === 'admin_restrito') {
      const alvo = await User.findById(req.params.id).select('role');
      if (!alvo) return res.status(404).json({ error: "Usuário não encontrado." });
      if (alvo.role === 'admin' || alvo.role === 'admin_restrito' || alvo.role === 'professor') {
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
    
    // Admin pode alterar senha, admin_restrito NÃO pode alterar senha
    if (password && password.length >= 6) {
      if (userRole === 'admin') {
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(password, salt);
        
        // Cancela solicitações pendentes quando admin altera senha
        await SolicitacaoSenha.updateMany(
          { usuario: req.params.id, status: 'pendente' },
          { 
            status: 'cancelada',
            dataResposta: new Date(),
            motivo: 'Senha alterada pelo admin manualmente'
          }
        );
      } else {
        return res.status(403).json({ error: "Admin restrito não pode alterar senhas de usuários." });
      }
    }

    // Campos de investimento
    if (statusPagamento) updateData.statusPagamento = statusPagamento;
    if (modalidade !== undefined) updateData.modalidade = modalidade;
    if (valorTotalCurso !== undefined) updateData.valorTotalCurso = valorTotalCurso;
    if (valorPago !== undefined) updateData.valorPago = valorPago;
    if (apostila !== undefined) updateData.apostila = apostila;
    if (combo !== undefined) updateData.combo = combo;
    if (turma !== undefined) updateData.turma = turma;

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
