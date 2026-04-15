const express = require('express');
const router = express.Router();
const cursoController = require('../controllers/cursoController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware'); 

// 1. Rotas fixas e específicas
router.get('/meus-cursos', authMiddleware, cursoController.meusCursos);
router.get('/progresso/aluno', authMiddleware, cursoController.buscarProgresso);
router.post('/concluir-aula', authMiddleware, cursoController.concluirAula);

// --- Rotas do Fórum ---
// AJUSTADO: Nome da função corrigido para 'excluirMensagemForum' e parâmetro para ':mensagemId'
router.delete('/forum/mensagem/:mensagemId', authMiddleware, cursoController.excluirMensagemForum);

// Admin
router.get('/', authMiddleware, cursoController.listarCursos);
router.post('/', authMiddleware, cursoController.criarCurso);

// 2. Rotas com parâmetros genéricos
router.get('/:cursoId/forum', authMiddleware, cursoController.listarMensagensForum);
router.post('/:cursoId/forum', authMiddleware, upload.single('anexo'), cursoController.enviarMensagemForum);
router.post('/:id/matricular', authMiddleware, cursoController.matricularAluno);
router.put('/:id', authMiddleware, cursoController.editarCurso);
router.delete('/:id', authMiddleware, cursoController.removerCurso);

// Rota genérica por último
router.get('/:id', authMiddleware, cursoController.buscarCursoPorId);

module.exports = router;
