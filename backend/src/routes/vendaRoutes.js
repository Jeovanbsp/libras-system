const express = require('express');
const router = express.Router();
const vendaController = require('../controllers/vendaController');
const auth = require('../middlewares/authMiddleware');

// Rota protegida pelo middleware 'auth'
router.post('/matricular', auth, vendaController.realizarMatricula);

module.exports = router;