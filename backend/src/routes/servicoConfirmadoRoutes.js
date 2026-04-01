const express = require('express');
const router = express.Router();
const servicoConfirmadoController = require('../controllers/servicoConfirmadoController');
const authMiddleware = require('../middlewares/authMiddleware');

// Todas as rotas de serviços são protegidas
router.post('/', authMiddleware, servicoConfirmadoController.criarServico);
router.get('/', authMiddleware, servicoConfirmadoController.listarServicos);
router.delete('/:id', authMiddleware, servicoConfirmadoController.removerServico);

module.exports = router;