const User = require('../models/User');
const Curso = require('../models/Curso');
const AuditLog = require('../models/AuditLog');

exports.liberarCursoManual = async (req, res) => {
  try {
    const userRole = req.user?.role;
    if (userRole === 'professor') {
      return res.status(403).json({ message: "Professor não pode liberar cursos." });
    }
    
    const { alunoId, cursoId } = req.body;

    const aluno = await User.findById(alunoId);
    if (!aluno) return res.status(404).json({ message: "Aluno não encontrado." });

    const curso = await Curso.findById(cursoId);
    if (!curso) return res.status(404).json({ message: "Curso não encontrado." });

    const jaTem = aluno.cursosMatriculados.some(id => id.toString() === cursoId);
    
    if (!jaTem) {
      aluno.cursosMatriculados.push(cursoId);
      await aluno.save();

      // Notificação em tempo real para o aluno
      const io = req.app.get('io');
      if (io) {
        io.emit(`aluno:${alunoId}:novoCurso`, {
          cursoNome: curso.nome || curso.titulo,
          cursoId: cursoId
        });
      }

      return res.status(200).json({ message: "Curso liberado com sucesso para o aluno!" });
    } else {
      return res.status(400).json({ message: "O aluno já possui acesso a este curso." });
    }
  } catch (error) {
    console.error("Erro ao liberar curso:", error);
    res.status(500).json({ message: "Erro interno ao liberar curso." });
  }
};

exports.listarAlunos = async (req, res) => {
  try {
    const alunos = await User.find({ role: 'aluno' }).select('-password').sort({ createdAt: -1 });
    res.json(alunos);
  } catch (error) {
    res.status(500).json({ message: "Erro ao listar alunos." });
  }
};

exports.listarTodosUsuarios = async (req, res) => {
  try {
    const { busca, dataInicio, dataFim } = req.query;
    let filtro = {};

    if (busca) {
      filtro.$or = [
        { nome: { $regex: new RegExp(busca, 'i') } },
        { email: { $regex: new RegExp(busca, 'i') } }
      ];
    }

    if (dataInicio || dataFim) {
      filtro.createdAt = {};
      if (dataInicio) filtro.createdAt.$gte = new Date(dataInicio);
      if (dataFim) {
        let fim = new Date(dataFim);
        fim.setHours(23, 59, 59, 999);
        filtro.createdAt.$lte = fim;
      }
    }

    const usuarios = await User.find(filtro).select('-password').sort({ createdAt: -1 });
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ message: "Erro ao listar todos os utilizadores." });
  }
};

exports.getLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate('userId', 'nome role')
      .sort({ timestamp: -1 })
      .limit(200)
      .lean();
    res.json(logs);
  } catch (error) {
    console.error("Erro ao buscar logs:", error);
    res.status(500).json({ message: "Erro ao buscar logs de auditoria." });
  }
};
