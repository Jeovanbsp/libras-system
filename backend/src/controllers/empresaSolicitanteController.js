const EmpresaSolicitante = require('../models/EmpresaSolicitante');

// Criar uma nova empresa solicitante
exports.criarEmpresa = async (req, res) => {
  try {
    const novaEmpresa = await EmpresaSolicitante.create(req.body);
    res.status(201).json(novaEmpresa);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Ja existe uma empresa cadastrada com este nome.' });
    }
    res.status(400).json({ message: error.message });
  }
};

// Listar empresas solicitantes (com busca por nome ou sigla)
exports.listarEmpresas = async (req, res) => {
  try {
    const { busca } = req.query;
    let filtro = {};

    if (busca) {
      filtro = {
        $or: [
          { nome: { $regex: new RegExp(busca, 'i') } },
          { sigla: { $regex: new RegExp(busca, 'i') } }
        ]
      };
    }

    const empresas = await EmpresaSolicitante.find(filtro).sort({ criadoEm: -1 });
    res.status(200).json(empresas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Buscar empresa por ID
exports.buscarPorId = async (req, res) => {
  try {
    const empresa = await EmpresaSolicitante.findById(req.params.id);
    if (!empresa) {
      return res.status(404).json({ message: 'Empresa solicitante nao encontrada.' });
    }
    res.status(200).json(empresa);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Atualizar empresa solicitante
exports.atualizarEmpresa = async (req, res) => {
  try {
    const empresaAtualizada = await EmpresaSolicitante.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!empresaAtualizada) {
      return res.status(404).json({ message: 'Empresa solicitante nao encontrada.' });
    }

    res.status(200).json(empresaAtualizada);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Remover empresa solicitante
exports.removerEmpresa = async (req, res) => {
  try {
    const empresa = await EmpresaSolicitante.findByIdAndDelete(req.params.id);
    if (!empresa) {
      return res.status(404).json({ message: 'Empresa solicitante nao encontrada.' });
    }
    res.status(200).json({ message: 'Empresa solicitante removida com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
