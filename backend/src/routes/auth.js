const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rota para buscar dados do usuário logado (Essencial para o Frontend)
router.get('/me', authMiddleware, authController.getMe);

router.post('/register', authMiddleware, authController.register);
router.post('/login', authController.login);
router.post('/update-password', authMiddleware, authController.updatePassword);

module.exports = router;