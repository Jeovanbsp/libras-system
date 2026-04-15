const mongoose = require('mongoose');
const EmpresaSolicitante = require('../models/EmpresaSolicitante');

// Criar uma nova empresa solicitante
exports.criarEmpresa = async (req, res) => {
  try {
    const { nome } = req.body;

    if (!nome || !nome.trim()) {
      return res.status(400).json({ message: 'O campo "nome" é obrigatório.' });
    }

    const novaEmpresa = await EmpresaSolicitante.create(req.body);
    res.status(201).json(novaEmpresa);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Já existe uma empresa cadastrada com este nome.' });
    }
    if (error.name === 'ValidationError') {
      const mensagens = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: mensagens.join('. ') });
    }
    res.status(500).json({ message: 'Erro interno ao criar empresa solicitante.' });
  }
};

// Listar empresas solicitantes (com busca por nome ou sigla)
exports.listarEmpresas = async (req, res) => {
  try {
    const { busca, ativo } = req.query;
    let filtro = {};

    if (busca) {
      filtro.$or = [
        { nome: { $regex: new RegExp(busca, 'i') } },
        { sigla: { $regex: new RegExp(busca, 'i') } }
      ];
    }

    if (ativo !== undefined) {
      if (ativo !== 'true' && ativo !== 'false') {
        return res.status(400).json({ message: 'O parâmetro "ativo" deve ser "true" ou "false".' });
      }
      filtro.ativo = ativo === 'true';
    }

    const empresas = await EmpresaSolicitante.find(filtro).sort({ criadoEm: -1 });
    res.status(200).json(empresas);
  } catch (error) {
    res.status(500).json({ message: 'Erro interno ao listar empresas solicitantes.' });
  }
};

// Buscar uma empresa por ID
exports.buscarPorId = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'ID inválido.' });
    }

    const empresa = await EmpresaSolicitante.findById(req.params.id);
    if (!empresa) {
      return res.status(404).json({ message: 'Empresa solicitante não encontrada.' });
    }
    res.status(200).json(empresa);
  } catch (error) {
    res.status(500).json({ message: 'Erro interno ao buscar empresa solicitante.' });
  }
};

// Atualizar uma empresa solicitante
exports.atualizarEmpresa = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'ID inválido.' });
    }

    const empresaAtualizada = await EmpresaSolicitante.findByIdAndUpdate(
      req.params.id,
      { ...req.body, atualizadoEm: Date.now() },
      { new: true, runValidators: true }
    );

    if (!empresaAtualizada) {
      return res.status(404).json({ message: 'Empresa solicitante não encontrada.' });
    }

    res.status(200).json(empresaAtualizada);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Já existe uma empresa cadastrada com este nome.' });
    }
    if (error.name === 'ValidationError') {
      const mensagens = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: mensagens.join('. ') });
    }
    res.status(500).json({ message: 'Erro interno ao atualizar empresa solicitante.' });
  }
};

// Remover uma empresa solicitante
exports.removerEmpresa = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'ID inválido.' });
    }

    const empresa = await EmpresaSolicitante.findByIdAndDelete(req.params.id);
    if (!empresa) {
      return res.status(404).json({ message: 'Empresa solicitante não encontrada.' });
    }

    res.status(200).json({ message: 'Empresa solicitante removida com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: 'Erro interno ao remover empresa solicitante.' });
  }
};
