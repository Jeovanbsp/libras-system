const express = require('express');
const router = express.Router();
const cursoController = require('../controllers/cursoController');
const authMiddleware = require('../middlewares/authMiddleware');

// ==========================================
// ROTAS DO ALUNO (ÁREA DE ESTUDOS)
// ==========================================

// Lista apenas os cursos que o aluno logado possui
router.get('/meus-cursos', authMiddleware, cursoController.meusCursos);

// Realiza a matrícula de um curso específico
router.post('/:id/matricular', authMiddleware, cursoController.matricularAluno);

// Busca a lista de IDs das atividades/materiais que o aluno já concluiu
router.get('/progresso/aluno', authMiddleware, cursoController.buscarProgresso);

// Marca um material/atividade específica como concluída (Body: materialId)
router.post('/concluir-aula', authMiddleware, cursoController.concluirAula);

// Busca detalhes de um curso específico
router.get('/:id', authMiddleware, cursoController.buscarCursoPorId);

// ==========================================
// FÓRUM DO CURSO (NOVO)
// ==========================================

// Listar mensagens do fórum de um curso específico
router.get('/:cursoId/forum', authMiddleware, cursoController.listarMensagensForum);

// Enviar uma nova mensagem para o fórum
router.post('/:cursoId/forum', authMiddleware, cursoController.enviarMensagemForum);

// ==========================================
// ROTAS GERAIS E ADMIN (GESTÃO)
// ==========================================

// Listar todos os cursos
router.get('/', cursoController.listarCursos);

// Criar novo curso (Admin)
router.post('/', authMiddleware, cursoController.criarCurso);

// Editar curso existente (Admin)
router.put('/:id', authMiddleware, cursoController.editarCurso);

// Remover curso (Admin)
router.delete('/:id', authMiddleware, cursoController.removerCurso);

module.exports = router;