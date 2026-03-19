const Curso = require('../models/Curso');
const User = require('../models/User');

// --- GESTÃO DE CURSOS (ADMIN) ---
exports.criarCurso = async (req, res) => {
  try {
    const novoCurso = new Curso(req.body);
    await novoCurso.save();
    res.status(201).json(novoCurso);
  } catch (error) {
    res.status(400).json({ error: "Erro ao criar curso: " + error.message });
  }
};

exports.listarCursos = async (req, res) => {
  try {
    const cursos = await Curso.find().sort({ dataCriacao: -1 });
    res.json(cursos);
  } catch (error) {
    res.status(500).json({ error: "Erro ao listar cursos" });
  }
};

exports.buscarCursoPorId = async (req, res) => {
  try {
    const curso = await Curso.findById(req.params.id);
    if (!curso) return res.status(404).json({ message: "Curso não encontrado." });
    res.json(curso);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar curso" });
  }
};

// ADICIONADO: Função para Editar Curso
exports.editarCurso = async (req, res) => {
  try {
    const cursoAtualizado = await Curso.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!cursoAtualizado) return res.status(404).json({ message: "Curso não encontrado para editar." });
    res.json(cursoAtualizado);
  } catch (err) {
    res.status(500).json({ error: "Erro ao editar curso" });
  }
};

// ADICIONADO: Função para Remover Curso
exports.removerCurso = async (req, res) => {
  try {
    const cursoRemovido = await Curso.findByIdAndDelete(req.params.id);
    if (!cursoRemovido) return res.status(404).json({ message: "Curso não encontrado para remover." });
    res.json({ msg: "Curso removido com sucesso" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao remover curso" });
  }
};

// --- MATRÍCULA E ACESSO (ALUNO) ---
exports.matricularAluno = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    const cursoId = req.params.id;

    const curso = await Curso.findById(cursoId);
    if (!curso) return res.status(404).json({ message: "Curso não encontrado." });

    if (!curso.gratuito) {
      return res.status(403).json({ 
        message: "Este curso requer liberação manual. Entre em contato com o suporte.",
        whatsapp: "5571988361371" 
      });
    }

    const user = await User.findById(userId);
    const jaMatriculado = user.cursosMatriculados.some(id => id.toString() === cursoId);
    
    if (jaMatriculado) {
      return res.status(400).json({ message: "Você já possui este curso!" });
    }

    user.cursosMatriculados.push(cursoId);
    await user.save();

    res.status(200).json({ message: "Matrícula realizada com sucesso!" });
  } catch (error) {
    res.status(500).json({ message: "Erro ao processar matrícula." });
  }
};

exports.meusCursos = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    const user = await User.findById(userId).populate('cursosMatriculados');
    res.status(200).json(user.cursosMatriculados);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar seus cursos." });
  }
};

// --- PROGRESSO ---
exports.concluirAula = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    const { aulaId } = req.body;
    const user = await User.findById(userId);
    
    if (!user.aulasConcluidas.includes(aulaId)) {
      user.aulasConcluidas.push(aulaId);
      await user.save();
    }
    res.status(200).json({ aulasConcluidas: user.aulasConcluidas });
  } catch (error) {
    res.status(500).json({ message: "Erro ao salvar progresso." });
  }
};

exports.buscarProgresso = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    const user = await User.findById(userId).select('aulasConcluidas');
    res.json(user.aulasConcluidas || []);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar progresso." });
  }
};