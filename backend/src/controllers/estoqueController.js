const EstoqueMaterial = require('../models/EstoqueMaterial');

// Adicionar um novo material ao stock
exports.criarItem = async (req, res) => {
  try {
    const novoItem = await EstoqueMaterial.create(req.body);
    res.status(201).json(novoItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Listar todos os materiais com pesquisa e filtros
exports.listarItens = async (req, res) => {
  try {
    const { busca, tipo } = req.query;
    let filtro = {};

    if (busca) {
      filtro.nome = { $regex: new RegExp(busca, 'i') };
    }
    if (tipo) {
      filtro.tipo = tipo;
    }

    const itens = await EstoqueMaterial.find(filtro).sort({ dataCadastro: -1 });
    res.status(200).json(itens);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Atualizar informações ou quantidades de um material
exports.atualizarItem = async (req, res) => {
  try {
    const itemAtualizado = await EstoqueMaterial.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!itemAtualizado) {
      return res.status(404).json({ message: 'Material não encontrado.' });
    }

    res.status(200).json(itemAtualizado);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Remover um material do stock
exports.removerItem = async (req, res) => {
  try {
    const item = await EstoqueMaterial.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Material não encontrado.' });
    }
    res.status(200).json({ message: 'Material removido com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};