const express = require('express');
const router = express.Router();
const Curso = require('../models/Curso');

// GET: Listar todos
router.get('/', async (req, res) => {
  const cursos = await Curso.find().sort({ dataCriacao: -1 });
  res.json(cursos);
});

// POST: Criar
router.post('/', async (req, res) => {
  const novoCurso = new Curso(req.body);
  await novoCurso.save();
  res.status(201).json(novoCurso);
});

// PUT: Editar curso existente
router.put('/:id', async (req, res) => {
  try {
    const cursoAtualizado = await Curso.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(cursoAtualizado);
  } catch (err) {
    res.status(500).json({ error: "Erro ao editar curso" });
  }
});

// DELETE: Apagar curso
router.delete('/:id', async (req, res) => {
  try {
    await Curso.findByIdAndDelete(req.params.id);
    res.json({ msg: "Curso removido" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao remover curso" });
  }
});

module.exports = router;