const Apostila = require('../models/Apostila');

exports.cadastrarApostila = async (req, res) => {
  try {
    const novaApostila = new Apostila(req.body);
    await novaApostila.save();
    res.status(201).json({ message: "Material cadastrado com sucesso!", data: novaApostila });
  } catch (error) {
    res.status(400).json({ error: "Erro ao cadastrar material: " + error.message });
  }
};

exports.listarMateriais = async (req, res) => {
  try {
    const materiais = await Apostila.find();
    res.json(materiais);
  } catch (error) {
    res.status(500).json({ error: "Erro ao listar materiais" });
  }
};