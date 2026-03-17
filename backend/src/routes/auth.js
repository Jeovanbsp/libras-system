const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rota de Login (Delegada para o controller)
router.post('/login', authController.login);

// --- NOVAS ROTAS DE REDEFINIÇÃO DE SENHA ---

// 1. Rota para solicitar o link (Esqueci a Senha)
// POST: /api/auth/forgot-password
router.post('/forgot-password', authController.forgotPassword);

// 2. Rota para salvar a nova senha usando o token
// POST: /api/auth/reset-password/:token
router.post('/reset-password/:token', authController.resetPassword);

module.exports = router;