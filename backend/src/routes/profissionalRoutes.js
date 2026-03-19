const express = require('express');
const router = express.Router();
const profissionalController = require('../controllers/profissionalController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rotas protegidas
router.post('/', authMiddleware, profissionalController.criarProfissional);
router.get('/', authMiddleware, profissionalController.listarProfissionais);
router.get('/:id', authMiddleware, profissionalController.buscarPorId);

// ADICIONE ESTA LINHA AQUI:
router.delete('/:id', authMiddleware, profissionalController.excluirProfissional);

module.exports = router;