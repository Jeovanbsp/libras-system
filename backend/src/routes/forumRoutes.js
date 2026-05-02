const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const ForumTopic = require('../models/ForumTopic');
const User = require('../models/User');

// Extrair @menções de um texto
const extrairMencoes = (texto) => {
  const regex = /@(\w+)/g;
  const matches = [];
  let match;
  while ((match = regex.exec(texto)) !== null) {
    matches.push(match[1]);
  }
  return matches;
};

// Listar todos os tópicos
router.get('/topics', auth, async (req, res) => {
  try {
    const topics = await ForumTopic.find()
      .populate('autor', 'nome role')
      .sort({ fixado: -1, dataCriacao: -1 })
      .lean();
    
    // Debug: retorna info do primeiro autor INCLUSIVE no campo extra
    if (topics.length > 0 && topics[0].autor) {
      topics[0].autorDebug = topics[0].autor.role;
      console.log('[DEBUG] autor.role DO BANCO:', topics[0].autor.role);
    }
    res.json(topics);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao listar tópicos' });
  }
});

// Buscar todos os usuários (para autocomplete de @menções)
router.get('/users', auth, async (req, res) => {
  try {
    const users = await User.find({}).select('nome role').lean();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao listar usuários' });
  }
});

// Criar novo tópico (admin, admin_restrito, professor)
router.post('/topics', auth, async (req, res) => {
  // Verificar se é admin ou professor
  if (!['admin', 'admin_restrito', 'professor'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Apenas administradores e professores podem criar tópicos no fórum.' });
  }

  try {
    const { titulo, conteudo, categoria } = req.body;
    const mencoes = extrairMencoes(conteudo);
    const topic = await ForumTopic.create({
      titulo,
      conteudo,
      categoria: categoria || 'Geral',
      autor: req.user.id,
      mencoes
    });
    const populated = await topic.populate('autor', 'nome role');

    // Notificar mencionados via socket
    const io = req.app.get('io');
    if (io && mencoes.length > 0) {
      mencoes.forEach(nome => {
        io.emit(`mencao:${nome}`, {
          topico: titulo,
          de: req.user.nome || 'Alguém',
          topicId: topic._id
        });
      });
    }

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao criar tópico' });
  }
});

// Buscar tópico por ID com respostas populadas
router.get('/topics/:id', auth, async (req, res) => {
  try {
    const topic = await ForumTopic.findById(req.params.id)
      .populate('autor', 'nome role')
      .populate('respostas.autor', 'nome role')
      .lean();
    if (!topic) return res.status(404).json({ message: 'Tópico não encontrado' });
    
    // Debug
    if (topic.respostas && topic.respostas.length > 0) {
      console.log('[DEBUG] Primeira resposta autor.role:', topic.respostas[0].autor?.role);
    }
    res.json(topic);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar tópico' });
  }
});

// Deletar tópico (admin, professor ou autor)
router.delete('/topics/:id', auth, async (req, res) => {
  try {
    const topic = await ForumTopic.findById(req.params.id);
    if (!topic) return res.status(404).json({ message: 'Tópico não encontrado' });
    const isAdmin = ['admin', 'admin_restrito', 'professor'].includes(req.user.role);
    const isAutor = topic.autor.toString() === req.user.id;
    if (!isAdmin && !isAutor) return res.status(403).json({ message: 'Sem permissão' });
    await ForumTopic.findByIdAndDelete(req.params.id);
    res.json({ message: 'Tópico excluído' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao excluir tópico' });
  }
});

// Adicionar resposta
router.post('/topics/:id/replies', auth, async (req, res) => {
  try {
    const { texto } = req.body;
    const mencoes = extrairMencoes(texto);
    const topic = await ForumTopic.findById(req.params.id);
    if (!topic) return res.status(404).json({ message: 'Tópico não encontrado' });

    topic.respostas.push({
      autor: req.user.id,
      texto,
      mencoes
    });
    await topic.save();
    await topic.populate('autor', 'nome role');
    await topic.populate('respostas.autor', 'nome role');

    // Notificar mencionados via socket
    const io = req.app.get('io');
    if (io && mencoes.length > 0) {
      mencoes.forEach(nome => {
        io.emit(`mencao:${nome}`, {
          topico: topic.titulo,
          de: req.user.nome || 'Alguém',
          topicId: topic._id
        });
      });
    }

    res.json(topic);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao responder tópico' });
  }
});

// Editar resposta
router.put('/topics/:id/replies/:replyId', auth, async (req, res) => {
  try {
    const topic = await ForumTopic.findById(req.params.id);
    if (!topic) return res.status(404).json({ message: 'Tópico não encontrado' });

    const reply = topic.respostas.id(req.params.replyId);
    if (!reply) return res.status(404).json({ message: 'Resposta não encontrada' });

    const isAdmin = ['admin', 'admin_restrito', 'professor'].includes(req.user.role);
    const isAutor = reply.autor.toString() === req.user.id;
    if (!isAdmin && !isAutor) return res.status(403).json({ message: 'Sem permissão' });

    reply.texto = req.body.texto;
    reply.editada = true;
    reply.mencoes = extrairMencoes(req.body.texto);
    await topic.save();
    await topic.populate('autor', 'nome role');
    await topic.populate('respostas.autor', 'nome role');
    res.json(topic);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao editar resposta' });
  }
});

// Excluir resposta
router.delete('/topics/:id/replies/:replyId', auth, async (req, res) => {
  try {
    const topic = await ForumTopic.findById(req.params.id);
    if (!topic) return res.status(404).json({ message: 'Tópico não encontrado' });

    const reply = topic.respostas.id(req.params.replyId);
    if (!reply) return res.status(404).json({ message: 'Resposta não encontrada' });

    const isAdmin = ['admin', 'admin_restrito', 'professor'].includes(req.user.role);
    const isAutor = reply.autor.toString() === req.user.id;
    if (!isAdmin && !isAutor) return res.status(403).json({ message: 'Sem permissão' });

    reply.deleteOne();
    await topic.save();
    await topic.populate('autor', 'nome role');
    await topic.populate('respostas.autor', 'nome role');
    res.json(topic);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao excluir resposta' });
  }
});

module.exports = router;
