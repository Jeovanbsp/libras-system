const express = require('express');
const router = express.Router();
const cursoController = require('../controllers/cursoController');
const authMiddleware = require('../middlewares/authMiddleware');

// ==========================================
// ROTAS DO ALUNO
// ==========================================

// Lista apenas os cursos que o aluno logado possui
router.get('/meus-cursos', authMiddleware, cursoController.meusCursos);

// Realiza a matrícula/compra de um curso específico
router.post('/:id/matricular', authMiddleware, cursoController.matricularAluno);

// BUSCA DETALHES DE UM CURSO (Essencial para carregar a Sala de Aula)
router.get('/:id', authMiddleware, cursoController.buscarCursoPorId);

// ==========================================
// ROTAS GERAIS E ADMIN
// ==========================================

// Listar todos os cursos (para o catálogo/loja)
router.get('/', cursoController.listarCursos);

// Criar novo curso
router.post('/', cursoController.criarCurso);

// Editar curso existente
router.put('/:id', cursoController.editarCurso);

// Remover curso
router.delete('/:id', cursoController.removerCurso);

module.exports = router;