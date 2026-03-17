const express = require('express');
const router = express.Router();
const profissionalController = require('../controllers/profissionalController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rotas protegidas (apenas admin deve cadastrar profissionais)
router.post('/', authMiddleware, profissionalController.criarProfissional);
router.get('/', authMiddleware, profissionalController.listarProfissionais);
router.get('/:id', authMiddleware, profissionalController.buscarPorId);

module.exports = router;