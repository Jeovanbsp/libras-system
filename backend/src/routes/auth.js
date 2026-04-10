const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware'); // Necessário para update-password

// Cadastro e Login
router.post('/register', authController.register);
router.post('/login', authController.login);

// Recuperação de senha via E-mail (Fluxo "Esqueci minha senha")
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

// Alteração de senha logado (Fluxo "Primeiro Acesso")
// Esta rota exige que o usuário envie o Token JWT gerado no login
router.post('/update-password', authMiddleware, authController.updatePassword);

module.exports = router;