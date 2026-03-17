const express = require('express');
const router = express.Router();
const clienteB2bController = require('../controllers/clienteB2bController');
const authMiddleware = require('../middlewares/authMiddleware');

// Todas as rotas B2B devem ser protegidas (apenas admin)
router.post('/', authMiddleware, clienteB2bController.criarCliente);
router.get('/', authMiddleware, clienteB2bController.listarClientes);
router.delete('/:id', authMiddleware, clienteB2bController.removerCliente);

module.exports = router;