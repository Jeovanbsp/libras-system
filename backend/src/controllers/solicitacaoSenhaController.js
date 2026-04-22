const SolicitacaoSenha = require('../models/SolicitacaoSenha');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Aluno solicita nova senha
exports.solicitarSenha = async (req, res) => {
  try {
    const { email, novaSenha } = req.body;
    
    const usuario = await User.findOne({ email });
    if (!usuario) {
      return res.status(404).json({ message: "E-mail não encontrado." });
    }
    
    if (!novaSenha || novaSenha.length < 6) {
      return res.status(400).json({ message: "A senha deve ter pelo menos 6 caracteres." });
    }
    
    // Criar solicitação
    const solicitacao = new SolicitacaoSenha({
      usuario: usuario._id,
      email: email,
      novaSenha: novaSenha
    });
    
    await solicitacao.save();
    res.status(201).json({ message: "Solicitação enviada para aprovação do admin!" });
  } catch (err) {
    res.status(500).json({ message: "Erro ao processar solicitação." });
  }
};

// Listar solicitações pendentes (para admin)
exports.listarSolicitacoes = async (req, res) => {
  try {
    const solicitacoes = await SolicitacaoSenha.find({ status: 'pendente' })
      .populate('usuario', 'nome role turma')
      .sort({ dataSolicitacao: -1 });
    res.json(solicitacoes);
  } catch (err) {
    res.status(500).json({ message: "Erro ao buscar solicitações." });
  }
};

// Admin aprova ou rejeita
exports.responderSolicitacao = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'aprovar' ou 'rejeitar'
    const adminId = req.user?.id;
    
    const solicitacao = await SolicitacaoSenha.findById(id).populate('usuario');
    if (!solicitacao) {
      return res.status(404).json({ message: "Solicitação não encontrada." });
    }
    
    if (solicitacao.status !== 'pendente') {
      return res.status(400).json({ message: "Esta solicitação já foi respondida." });
    }
    
    if (action === 'aprovar') {
      // Atualizar senha do usuário
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(solicitacao.novaSenha, salt);
      
      await User.findByIdAndUpdate(solicitacao.usuario._id, { password: hashedPassword });
      
      solicitacao.status = 'aprovada';
      solicitacao.dataResposta = new Date();
      solicitacao.respondidoPor = adminId;
      await solicitacao.save();
      
      res.json({ message: "Senha atualizada com sucesso!" });
    } else {
      solicitacao.status = 'rejeitada';
      solicitacao.dataResposta = new Date();
      solicitacao.respondidoPor = adminId;
      await solicitacao.save();
      
      res.json({ message: "Solicitação rejeitada." });
    }
  } catch (err) {
    res.status(500).json({ message: "Erro ao processar resposta." });
  }
};
