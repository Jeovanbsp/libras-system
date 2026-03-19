const User = require('../models/User');
const Curso = require('../models/Curso');

exports.liberarCursoManual = async (req, res) => {
  try {
    const { alunoId, cursoId } = req.body;

    const aluno = await User.findById(alunoId);
    if (!aluno) {
      return res.status(404).json({ message: "Aluno não encontrado." });
    }

    const curso = await Curso.findById(cursoId);
    if (!curso) {
      return res.status(404).json({ message: "Curso não encontrado." });
    }

    // Verifica se o aluno já tem o curso para não duplicar
    const jaTem = aluno.cursosMatriculados.some(id => id.toString() === cursoId);
    
    if (!jaTem) {
      aluno.cursosMatriculados.push(cursoId);
      await aluno.save();
      return res.status(200).json({ message: "Curso liberado com sucesso para o aluno!" });
    } else {
      return res.status(400).json({ message: "O aluno já possui acesso a este curso." });
    }

  } catch (error) {
    console.error("Erro na liberação manual:", error);
    res.status(500).json({ message: "Erro interno ao liberar curso." });
  }
};

// Listar todos os alunos (Útil para você selecionar no formulário de liberação)
exports.listarAlunos = async (req, res) => {
  try {
    const alunos = await User.find({ role: 'aluno' }).select('nome email');
    res.json(alunos);
  } catch (error) {
    res.status(500).json({ message: "Erro ao listar alunos." });
  }
};