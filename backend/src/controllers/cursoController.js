const Curso = require('../models/Curso');
const User = require('../models/User');
const ForumMessage = require('../models/ForumMessage'); // Integração do Fórum

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

exports.editarCurso = async (req, res) => {
  try {
    const cursoAtualizado = await Curso.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!cursoAtualizado) return res.status(404).json({ message: "Curso não encontrado para editar." });
    res.json(cursoAtualizado);
  } catch (err) {
    res.status(500).json({ error: "Erro ao editar curso" });
  }
};

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
    const { materialId } = req.body; 
    
    if (!materialId) {
      return res.status(400).json({ message: "ID do material/atividade não fornecido." });
    }

    const user = await User.findById(userId);
    
    if (!user.materiaisConcluidos.includes(materialId)) {
      user.materiaisConcluidos.push(materialId);
      await user.save();
    }
    
    res.status(200).json({ materiaisConcluidos: user.materiaisConcluidos });
  } catch (error) {
    res.status(500).json({ message: "Erro ao salvar progresso da atividade." });
  }
};

exports.buscarProgresso = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    const user = await User.findById(userId).select('materiaisConcluidos');
    res.json(user.materiaisConcluidos || []);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar progresso do aluno." });
  }
};

// ==========================================
// FÓRUM DO CURSO
// ==========================================
exports.listarMensagensForum = async (req, res) => {
  try {
    const { cursoId } = req.params;
    const mensagens = await ForumMessage.find({ curso: cursoId })
      .populate('autor', 'nome role')
      .sort({ dataCriacao: 1 });

    const formatadas = mensagens.map(msg => ({
      _id: msg._id,
      autor: msg.autor ? msg.autor.nome : 'Usuário Removido',
      role: msg.autor ? msg.autor.role : 'aluno',
      texto: msg.texto,
      data: msg.dataCriacao
    }));

    res.status(200).json(formatadas);
  } catch (error) {
    res.status(500).json({ message: "Erro ao carregar o fórum." });
  }
};

exports.enviarMensagemForum = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    const { cursoId } = req.params;
    const { texto } = req.body;

    if (!texto) return res.status(400).json({ message: "A mensagem não pode estar vazia." });

    const novaMensagem = await ForumMessage.create({
      curso: cursoId,
      autor: userId,
      texto
    });

    await novaMensagem.populate('autor', 'nome role');

    res.status(201).json({
      _id: novaMensagem._id,
      autor: novaMensagem.autor.nome,
      role: novaMensagem.autor.role,
      texto: novaMensagem.texto,
      data: novaMensagem.dataCriacao
    });
  } catch (error) {
    res.status(500).json({ message: "Erro ao enviar mensagem." });
  }
};  