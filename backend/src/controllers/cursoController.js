const Curso = require('../models/Curso');

exports.criarCurso = async (req, res) => {
  try {
    const novoCurso = new Curso(req.body);
    await novoCurso.save();
    res.status(201).json({ message: "Curso configurado com sucesso!", data: novoCurso });
  } catch (error) {
    res.status(400).json({ error: "Erro ao configurar curso: " + error.message });
  }
};

exports.listarCursos = async (req, res) => {
  try {
    const cursos = await Curso.find();
    res.json(cursos);
  } catch (error) {
    res.status(500).json({ error: "Erro ao listar cursos" });
  }
};