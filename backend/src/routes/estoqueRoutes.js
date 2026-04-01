const express = require('express');
const router = express.Router();
const estoqueController = require('../controllers/estoqueController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rotas protegidas para gestão de stock
router.post('/', authMiddleware, estoqueController.criarItem);
router.get('/', authMiddleware, estoqueController.listarItens);
router.put('/:id', authMiddleware, estoqueController.atualizarItem);
router.delete('/:id', authMiddleware, estoqueController.removerItem);

module.exports = router;