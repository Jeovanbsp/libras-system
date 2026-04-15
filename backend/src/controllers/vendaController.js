const Venda = require('../models/Venda');
const Curso = require('../models/Curso');
const Apostila = require('../models/Apostila');

exports.realizarMatricula = async (req, res) => {
  try {
    const { alunoId, cursoId, apostilaId } = req.body;

    const curso = await Curso.findById(cursoId);
    let valorTotal = curso.valor;
    let desconto = 0;

    // Lógica do Combo (Escopo item 3)
    if (apostilaId) {
      const apostila = await Apostila.findById(apostilaId);
      valorTotal += apostila.precoVenda;

      // Se for curso de 60h, aplica 5% no total
      if (curso.cargaHoraria === 60) {
        desconto = valorTotal * 0.05;
        valorTotal -= desconto;
      }
    }

    const novaVenda = new Venda({
      alunoId,
      cursoId,
      apostilaId,
      valorBruto: valorTotal + desconto,
      descontoAplicado: desconto,
      valorFinal: valorTotal
    });

    await novaVenda.save();
    res.status(201).json({ message: "Matrícula realizada!", data: novaVenda });

  } catch (error) {
    res.status(400).json({ error: "Erro na matrícula: " + error.message });
  }
};
