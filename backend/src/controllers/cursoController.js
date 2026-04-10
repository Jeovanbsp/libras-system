const Curso = require('../models/Curso');
const User = require('../models/User');
const ForumMessage = require('../models/ForumMessage');

exports.criarCurso = async (req, res) => {
  try {
    const novoCurso = new Curso(req.body);
    await novoCurso.save();
    res.status(201).json(novoCurso);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.listarCursos = async (req, res) => {
  try {
    const cursos = await Curso.find().sort({ dataCriacao: -1 });
    res.json(cursos);
  } catch (error) {
    res.status(500).json({ error: "Erro ao listar." });
  }
};

exports.buscarCursoPorId = async (req, res) => {
  try {
    const curso = await Curso.findById(req.params.id);
    res.json(curso);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar." });
  }
};

exports.editarCurso = async (req, res) => {
  try {
    const curso = await Curso.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(curso);
  } catch (err) {
    res.status(500).json({ error: "Erro ao editar." });
  }
};

exports.removerCurso = async (req, res) => {
  try {
    await Curso.findByIdAndDelete(req.params.id);
    res.json({ msg: "Removido!" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao remover." });
  }
};

exports.matricularAluno = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    const cursoId = req.params.id;
    const user = await User.findById(userId);
    if (!user.cursosMatriculados.includes(cursoId)) {
      user.cursosMatriculados.push(cursoId);
      await user.save();
    }
    res.status(200).json({ message: "Matriculado!" });
  } catch (error) {
    res.status(500).json({ message: "Erro." });
  }
};

exports.meusCursos = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    const user = await User.findById(userId).populate('cursosMatriculados');
    res.status(200).json(user.cursosMatriculados);
  } catch (error) {
    res.status(500).json({ message: "Erro." });
  }
};

exports.concluirAula = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    const { materialId } = req.body; 
    const user = await User.findById(userId);
    if (!user.materiaisConcluidos.includes(materialId)) {
      user.materiaisConcluidos.push(materialId);
      await user.save();
    }
    res.status(200).json({ materiaisConcluidos: user.materiaisConcluidos });
  } catch (error) {
    res.status(500).json({ message: "Erro ao salvar." });
  }
};

exports.buscarProgresso = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    const user = await User.findById(userId).select('materiaisConcluidos');
    res.json(user.materiaisConcluidos || []);
  } catch (error) {
    res.status(500).json({ message: "Erro." });
  }
};

exports.listarMensagensForum = async (req, res) => {
  try {
    const mensagens = await ForumMessage.find({ curso: req.params.cursoId })
      .populate('autor', 'nome role').sort({ dataCriacao: 1 });
    res.status(200).json(mensagens.map(m => ({
      autor: m.autor.nome,
      role: m.autor.role,
      texto: m.texto,
      data: m.dataCriacao
    })));
  } catch (error) {
    res.status(500).json({ message: "Erro no fórum." });
  }
};

exports.enviarMensagemForum = async (req, res) => {
  try {
    const novaMsg = await ForumMessage.create({
      curso: req.params.cursoId,
      autor: req.user.id,
      texto: req.body.texto
    });
    await novaMsg.populate('autor', 'nome role');
    res.status(201).json(novaMsg);
  } catch (error) {
    res.status(500).json({ message: "Erro ao enviar." });
  }
};