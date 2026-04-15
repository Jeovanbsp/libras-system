const express = require('express');
const router = express.Router();
const empresaSolicitanteController = require('../controllers/empresaSolicitanteController');
const authMiddleware = require('../middlewares/authMiddleware');

// Todas as rotas de Empresa Solicitante devem ser protegidas
router.post('/', authMiddleware, empresaSolicitanteController.criarEmpresa);
router.get('/', authMiddleware, empresaSolicitanteController.listarEmpresas);
router.get('/:id', authMiddleware, empresaSolicitanteController.buscarPorId);
router.put('/:id', authMiddleware, empresaSolicitanteController.atualizarEmpresa);
router.delete('/:id', authMiddleware, empresaSolicitanteController.removerEmpresa);

module.exports = router;        