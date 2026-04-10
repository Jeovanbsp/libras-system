const express = require('express');
const router = express.Router();
const cursoController = require('../controllers/cursoController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/meus-cursos', authMiddleware, cursoController.meusCursos);
router.post('/:id/matricular', authMiddleware, cursoController.matricularAluno);
router.get('/progresso/aluno', authMiddleware, cursoController.buscarProgresso);
router.post('/concluir-aula', authMiddleware, cursoController.concluirAula);
router.get('/:id', authMiddleware, cursoController.buscarCursoPorId);

// Fórum
router.get('/:cursoId/forum', authMiddleware, cursoController.listarMensagensForum);
router.post('/:cursoId/forum', authMiddleware, cursoController.enviarMensagemForum);

// Admin
router.get('/', cursoController.listarCursos);
router.post('/', authMiddleware, cursoController.criarCurso);
router.put('/:id', authMiddleware, cursoController.editarCurso);
router.delete('/:id', authMiddleware, cursoController.removerCurso);

module.exports = router;