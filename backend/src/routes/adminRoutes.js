const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const upload = require('../middlewares/uploadMiddleware');
const auth = require('../middlewares/authMiddleware');

router.get('/alunos', auth, adminController.listarAlunos);
router.post('/liberar-curso', auth, adminController.liberarCursoManual);

// ROTA DE UPLOAD DE MATERIAL
router.post('/upload-material', auth, upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: "Arquivo não enviado." });
    res.json({ fileName: req.file.filename });
});

module.exports = router;