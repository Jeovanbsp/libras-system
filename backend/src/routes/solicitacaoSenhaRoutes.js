const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const solicitacaoSenhaController = require('../controllers/solicitacaoSenhaController');

// Rota pública para aluno solicitar nova senha
router.post('/', solicitacaoSenhaController.solicitarSenha);

// Rotas protegidas para admin
router.get('/', authMiddleware, solicitacaoSenhaController.listarSolicitacoes);
router.put('/:id/responder', authMiddleware, solicitacaoSenhaController.responderSolicitacao);

module.exports = router;
