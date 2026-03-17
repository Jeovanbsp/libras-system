const Profissional = require('../models/Profissional');

exports.criarProfissional = async (req, res) => {
  try {
    const novoProfissional = await Profissional.create(req.body);
    res.status(201).json(novoProfissional);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.listarProfissionais = async (req, res) => {
  try {
    // Permite filtrar por especialidade via query string: /profissionais?especialidade=Saúde
    const { especialidade } = req.query;
    const filtro = especialidade ? { especialidades: especialidade } : {};
    
    const profissionais = await Profissional.find(filtro);
    res.status(200).json(profissionais);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.buscarPorId = async (req, res) => {
  try {
    const profissional = await Profissional.findById(req.params.id);
    if (!profissional) return res.status(404).json({ message: 'Profissional não encontrado' });
    res.status(200).json(profissional);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};