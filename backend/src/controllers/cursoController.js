const Curso = require('../models/Curso');
const User = require('../models/User'); // Necessário para a matrícula

// --- ROTAS DO ADMIN ---

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

// BUSCAR CURSO ÚNICO (Essencial para a Sala de Aula do Aluno)
exports.buscarCursoPorId = async (req, res) => {
  try {
    const curso = await Curso.findById(req.params.id);
    if (!curso) {
      return res.status(404).json({ message: "Curso não encontrado." });
    }
    res.json(curso);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar os detalhes do curso: " + error.message });
  }
};

exports.editarCurso = async (req, res) => {
  try {
    const cursoAtualizado = await Curso.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(cursoAtualizado);
  } catch (err) {
    res.status(500).json({ error: "Erro ao editar curso" });
  }
};

exports.removerCurso = async (req, res) => {
  try {
    await Curso.findByIdAndDelete(req.params.id);
    res.json({ msg: "Curso removido" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao remover curso" });
  }
};

// --- ROTAS DO ALUNO ---

exports.matricularAluno = async (req, res) => {
  try {
    const userId = req.userId; // Vem do token pelo authMiddleware
    const cursoId = req.params.id;

    const user = await User.findById(userId);
    
    // Verifica se o aluno já possui o curso
    if (user.cursosMatriculados.includes(cursoId)) {
      return res.status(400).json({ message: "Você já está matriculado neste curso!" });
    }

    // Adiciona o curso ao perfil do aluno
    user.cursosMatriculados.push(cursoId);
    await user.save();

    res.status(200).json({ message: "Matrícula realizada com sucesso!" });
  } catch (error) {
    res.status(500).json({ message: "Erro ao realizar matrícula.", error: error.message });
  }
};

exports.meusCursos = async (req, res) => {
  try {
    // Busca o aluno e traz os dados completos dos cursos (populate)
    const user = await User.findById(req.userId).populate('cursosMatriculados');
    res.status(200).json(user.cursosMatriculados);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar seus cursos.", error: error.message });
  }
};