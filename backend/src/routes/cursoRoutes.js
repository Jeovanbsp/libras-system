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

// Busca a lista de IDs das aulas que o aluno já concluiu (Para a Barra de Progresso)
router.get('/progresso/aluno', authMiddleware, cursoController.buscarProgresso);

// Marca uma aula específica como concluída no banco de dados
router.post('/concluir-aula', authMiddleware, cursoController.concluirAula);

// Busca detalhes de um curso específico (Carrega módulos e aulas na Sala de Aula)
router.get('/:id', authMiddleware, cursoController.buscarCursoPorId);

// ==========================================
// ROTAS GERAIS E ADMIN (GESTÃO)
// ==========================================

// Listar todos os cursos (Para o catálogo/loja - Aberto ao público ou logado)
router.get('/', cursoController.listarCursos);

// Criar novo curso (Admin)
router.post('/', authMiddleware, cursoController.criarCurso);

// Editar curso existente (Admin)
router.put('/:id', authMiddleware, cursoController.editarCurso);

// Remover curso (Admin)
router.delete('/:id', authMiddleware, cursoController.removerCurso);

module.exports = router;