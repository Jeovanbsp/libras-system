const Profissional = require('../models/Profissional');

// Cadastrar novo profissional
exports.criarProfissional = async (req, res) => {
  try {
    const novoProfissional = await Profissional.create(req.body);
    res.status(201).json(novoProfissional);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Listar todos os profissionais (AGORA COM FILTROS AVANÇADOS)
exports.listarProfissionais = async (req, res) => {
  try {
    const { especialidade, nome, disponibilidade } = req.query;
    let filtro = {};

    // Filtro por Nome (ignorando maiúsculas e minúsculas)
    if (nome) {
      filtro.nome = { $regex: new RegExp(nome, 'i') };
    }
    
    // Filtro por Especialidade
    if (especialidade) {
      filtro.especialidades = especialidade;
    }

    // Filtro por Disponibilidade
    if (disponibilidade) {
      filtro.disponibilidade = disponibilidade;
    }
    
    const profissionais = await Profissional.find(filtro).sort({ dataCadastro: -1 });
    res.status(200).json(profissionais);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Buscar um profissional por ID
exports.buscarPorId = async (req, res) => {
  try {
    const profissional = await Profissional.findById(req.params.id);
    if (!profissional) return res.status(404).json({ message: 'Profissional não encontrado' });
    res.status(200).json(profissional);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- NOVA FUNÇÃO: ATUALIZAR/MODIFICAR PROFISSIONAL ---
exports.atualizarProfissional = async (req, res) => {
  try {
    const profissionalAtualizado = await Profissional.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true } // Retorna o doc atualizado e roda as validações do Model
    );

    if (!profissionalAtualizado) {
      return res.status(404).json({ message: "Profissional não encontrado" });
    }

    res.status(200).json(profissionalAtualizado);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// EXCLUIR PROFISSIONAL
exports.excluirProfissional = async (req, res) => {
  try {
    const profissional = await Profissional.findById(req.params.id);

    if (!profissional) {
      return res.status(404).json({ message: "Profissional não encontrado" });
    }

    await profissional.deleteOne();
    
    res.status(200).json({ message: "Profissional removido com sucesso!" });
  } catch (error) {
    console.error("Erro ao deletar profissional:", error.message);
    res.status(500).json({ message: "Erro interno ao tentar excluir o profissional" });
  }
};