const express = require('express');
const router = express.Router();
const cursoController = require('../controllers/cursoController');
const authMiddleware = require('../middlewares/authMiddleware');
// IMPORTANTE: Importe o seu middleware de upload do Multer
const upload = require('../middlewares/uploadMiddleware'); 

router.get('/meus-cursos', authMiddleware, cursoController.meusCursos);
router.post('/:id/matricular', authMiddleware, cursoController.matricularAluno);
router.get('/progresso/aluno', authMiddleware, cursoController.buscarProgresso);
router.post('/concluir-aula', authMiddleware, cursoController.concluirAula);
router.get('/:id', authMiddleware, cursoController.buscarCursoPorId);

// --- Fórum ---
router.get('/:cursoId/forum', authMiddleware, cursoController.listarMensagensForum);

// Adicionamos o "upload.single('anexo')" aqui. 
// A string 'anexo' é exatamente o nome que usamos no FormData do Vue.js
router.post('/:cursoId/forum', authMiddleware, upload.single('anexo'), cursoController.enviarMensagemForum);

// Admin
router.get('/', cursoController.listarCursos);
router.post('/', authMiddleware, cursoController.criarCurso);
router.put('/:id', authMiddleware, cursoController.editarCurso);
router.delete('/:id', authMiddleware, cursoController.removerCurso);

module.exports = router;