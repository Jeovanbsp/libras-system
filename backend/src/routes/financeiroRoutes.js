const express = require('express');
const router = express.Router();
const Financeiro = require('../models/Financeiro');

router.get('/', async (req, res) => {
  const transacoes = await Financeiro.find().sort({ data: -1 });
  res.json(transacoes);
});

router.post('/', async (req, res) => {
  const nova = new Financeiro(req.body);
  await nova.save();
  res.status(201).json(nova);
});

// DELETE: Apagar lançamento financeiro
router.delete('/:id', async (req, res) => {
  try {
    await Financeiro.findByIdAndDelete(req.params.id);
    res.json({ msg: "Lançamento removido" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao remover" });
  }
});

module.exports = router;