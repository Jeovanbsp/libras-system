const express = require('express');
const router = express.Router();
const EmpresaSolicitante = require('../models/EmpresaSolicitante');
const authMiddleware = require('../middlewares/authMiddleware');

// GET: Listar todas as empresas solicitantes
router.get('/', authMiddleware, async (req, res) => {
  try {
    const empresas = await EmpresaSolicitante.find().sort({ createdAt: -1 });
    res.json(empresas);
  } catch (error) {
    console.error('Erro ao listar empresas:', error);
    res.status(500).json({ error: 'Erro ao listar empresas', details: error.message });
  }
});

// GET: Buscar empresa por ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const empresa = await EmpresaSolicitante.findById(req.params.id);
    if (!empresa) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }
    res.json(empresa);
  } catch (error) {
    console.error('Erro ao buscar empresa:', error);
    res.status(500).json({ error: 'Erro ao buscar empresa', details: error.message });
  }
});

// POST: Criar nova empresa solicitante
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { nome, sigla, email, telefone, endereco, contato, ativo, descricao } = req.body;

    if (!nome) {
      return res.status(400).json({ error: 'Nome da empresa é obrigatório' });
    }

    const novaEmpresa = new EmpresaSolicitante({
      nome,
      sigla,
      email,
      telefone,
      endereco,
      contato,
      ativo: ativo !== undefined ? ativo : true,
      descricao
    });

    await novaEmpresa.save();
    res.status(201).json({ message: 'Empresa criada com sucesso', empresa: novaEmpresa });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Já existe uma empresa com este nome' });
    }
    console.error('Erro ao criar empresa:', error);
    res.status(400).json({ error: 'Erro ao criar empresa', details: error.message });
  }
});

// PUT: Atualizar empresa solicitante
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const empresa = await EmpresaSolicitante.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!empresa) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }

    res.json({ message: 'Empresa atualizada com sucesso', empresa });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Já existe uma empresa com este nome' });
    }
    console.error('Erro ao atualizar empresa:', error);
    res.status(400).json({ error: 'Erro ao atualizar empresa', details: error.message });
  }
});

// PATCH: Atualizar status (ativar/desativar)
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { ativo } = req.body;

    const empresa = await EmpresaSolicitante.findByIdAndUpdate(
      req.params.id,
      { ativo },
      { new: true }
    );

    if (!empresa) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }

    res.json({ message: `Empresa ${ativo ? 'ativada' : 'desativada'} com sucesso`, empresa });
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({ error: 'Erro ao atualizar status', details: error.message });
  }
});

// DELETE: Remover empresa solicitante
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const empresa = await EmpresaSolicitante.findByIdAndDelete(req.params.id);

    if (!empresa) {
      return res.status(404).json({ error: 'Empresa não encontrada' });
    }

    res.json({ message: 'Empresa removida com sucesso', empresa });
  } catch (error) {
    console.error('Erro ao remover empresa:', error);
    res.status(500).json({ error: 'Erro ao remover empresa', details: error.message });
  }
});

module.exports = router;        