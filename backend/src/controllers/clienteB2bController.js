const ClienteB2B = require('../models/ClienteB2B');

// Criar um novo cliente B2B
exports.criarCliente = async (req, res) => {
  try {
    const novoCliente = await ClienteB2B.create(req.body);
    res.status(201).json(novoCliente);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Já existe um cliente cadastrado com este CNPJ.' });
    }
    res.status(400).json({ message: error.message });
  }
};

// Listar todos os clientes
exports.listarClientes = async (req, res) => {
  try {
    const clientes = await ClienteB2B.find().sort({ dataCadastro: -1 });
    res.status(200).json(clientes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Apagar um cliente
exports.removerCliente = async (req, res) => {
  try {
    const cliente = await ClienteB2B.findByIdAndDelete(req.params.id);
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente corporativo não encontrado.' });
    }
    res.status(200).json({ message: 'Cliente removido com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};