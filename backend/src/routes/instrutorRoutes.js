const express = require('express');
const router = express.Router();
const Instrutor = require('../models/Instrutor');

// Listar todos
router.get('/', async (req, res) => {
  try {
    const instrutores = await Instrutor.find().sort({ nome: 1 });
    res.json(instrutores);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Buscar um
router.get('/:id', async (req, res) => {
  try {
    const instrutor = await Instrutor.findById(req.params.id);
    if (!instrutor) return res.status(404).json({ error: 'Não encontrado' });
    res.json(instrutor);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Criar
router.post('/', async (req, res) => {
  try {
    const instrutor = new Instrutor(req.body);
    await instrutor.save();
    res.status(201).json(instrutor);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// Atualizar
router.put('/:id', async (req, res) => {
  try {
    const instrutor = await Instrutor.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!instrutor) return res.status(404).json({ error: 'Não encontrado' });
    res.json(instrutor);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// Deletar
router.delete('/:id', async (req, res) => {
  try {
    const instrutor = await Instrutor.findByIdAndDelete(req.params.id);
    if (!instrutor) return res.status(404).json({ error: 'Não encontrado' });
    res.json({ message: 'Excluído com sucesso' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;