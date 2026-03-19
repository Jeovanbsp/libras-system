const Profissional = require('../models/Profissional');

// Cadastrar novo profissional (Já aceita whatsapp e observacoes via req.body)
exports.criarProfissional = async (req, res) => {
  try {
    const novoProfissional = await Profissional.create(req.body);
    res.status(201).json(novoProfissional);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Listar todos os profissionais
exports.listarProfissionais = async (req, res) => {
  try {
    const { especialidade } = req.query;
    const filtro = especialidade ? { especialidades: especialidade } : {};
    
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

// --- NOVA FUNÇÃO: EXCLUIR PROFISSIONAL ---
exports.excluirProfissional = async (req, res) => {
  try {
    const profissional = await Profissional.findById(req.params.id);

    if (!profissional) {
      return res.status(404).json({ message: "Profissional não encontrado" });
    }

    // Removendo do MongoDB
    await profissional.deleteOne();
    
    res.status(200).json({ message: "Profissional removido com sucesso!" });
  } catch (error) {
    console.error("Erro ao deletar profissional:", error.message);
    res.status(500).json({ message: "Erro interno ao tentar excluir o profissional" });
  }
};