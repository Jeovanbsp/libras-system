const express = require('express');
const router = express.Router();
const profissionalController = require('../controllers/profissionalController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rotas protegidas
router.post('/', authMiddleware, profissionalController.criarProfissional);
router.get('/', authMiddleware, profissionalController.listarProfissionais);
router.get('/:id', authMiddleware, profissionalController.buscarPorId);

// --- NOVA ROTA: ATUALIZAR PROFISSIONAL ---
router.put('/:id', authMiddleware, profissionalController.atualizarProfissional);

// ROTA EXCLUIR
router.delete('/:id', authMiddleware, profissionalController.excluirProfissional);

module.exports = router;