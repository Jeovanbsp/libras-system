const User = require('../models/User');
const Curso = require('../models/Curso');
const { escapeRegex } = require('../utils/sanitize');

exports.liberarCursoManual = async (req, res) => {
  try {
    const { alunoId, cursoId } = req.body;

    const aluno = await User.findById(alunoId);
    if (!aluno) return res.status(404).json({ message: "Aluno não encontrado." });

    const curso = await Curso.findById(cursoId);
    if (!curso) return res.status(404).json({ message: "Curso não encontrado." });

    const jaTem = aluno.cursosMatriculados.some(id => id.toString() === cursoId);
    
    if (!jaTem) {
      aluno.cursosMatriculados.push(cursoId);
      await aluno.save();
      return res.status(200).json({ message: "Curso liberado com sucesso para o aluno!" });
    } else {
      return res.status(400).json({ message: "O aluno já possui acesso a este curso." });
    }
  } catch (error) {
    res.status(500).json({ message: "Erro interno ao liberar curso." });
  }
};

// UTILIZADO PELO MODAL DE LIBERAR CURSOS (Traz apenas Alunos)
exports.listarAlunos = async (req, res) => {
  try {
    const alunos = await User.find({ role: 'aluno' }).select('-password').sort({ createdAt: -1 });
    res.json(alunos);
  } catch (error) {
    res.status(500).json({ message: "Erro ao listar alunos." });
  }
};

// NOVA FUNÇÃO: Traz TODOS os utilizadores para a Tabela de Gestão (Admins e Alunos)
exports.listarTodosUsuarios = async (req, res) => {
  try {
    const { busca, dataInicio, dataFim } = req.query;
    let filtro = {}; // Sem restrição de 'role', traz todos!

    if (busca) {
      const safeBusca = escapeRegex(busca);
      filtro.$or = [
        { nome: { $regex: new RegExp(safeBusca, 'i') } },
        { email: { $regex: new RegExp(safeBusca, 'i') } }
      ];
    }

    // Corrigido para utilizar createdAt (campo padrão do Mongoose timestamps)
    if (dataInicio || dataFim) {
      filtro.createdAt = {};
      if (dataInicio) filtro.createdAt.$gte = new Date(dataInicio);
      if (dataFim) {
        let fim = new Date(dataFim);
        fim.setHours(23, 59, 59, 999); // Vai até o último segundo do dia
        filtro.createdAt.$lte = fim;
      }
    }

    const usuarios = await User.find(filtro).select('-password').sort({ createdAt: -1 });
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ message: "Erro ao listar todos os utilizadores." });
  }
};
