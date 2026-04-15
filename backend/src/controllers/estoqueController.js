const EstoqueMaterial = require('../models/EstoqueMaterial');
const { escapeRegex } = require('../utils/sanitize');

exports.criarItem = async (req, res) => {
  try {
    const novoItem = await EstoqueMaterial.create(req.body);
    res.status(201).json(novoItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.atualizarItem = async (req, res) => {
  try {
    const item = await EstoqueMaterial.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.removerItem = async (req, res) => {
  try {
    await EstoqueMaterial.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Removido com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ATUALIZADO: Filtra por período e calcula as vendas!
exports.listarItens = async (req, res) => {
  try {
    const { busca, tipo, dataInicio, dataFim } = req.query;
    let filtro = {};

    if (busca) filtro.nome = { $regex: new RegExp(escapeRegex(busca), 'i') };
    if (tipo) filtro.tipo = tipo;

    const itens = await EstoqueMaterial.find(filtro).sort({ dataCadastro: -1 });

    // Lógica de Filtro de Datas
    let dataStart = dataInicio ? new Date(dataInicio) : null;
    let dataEnd = dataFim ? new Date(dataFim) : null;
    if (dataEnd) dataEnd.setHours(23, 59, 59, 999);

    let receitaTotalPeriodo = 0;

    const itensFormatados = itens.map(item => {
      let obj = item.toObject();
      let vendas = obj.historicoVendas || [];

      // Filtra as vendas deste item pelo período escolhido
      if (dataStart || dataEnd) {
        vendas = vendas.filter(v => {
          let ok = true;
          let d = new Date(v.data);
          if (dataStart && d < dataStart) ok = false;
          if (dataEnd && d > dataEnd) ok = false;
          return ok;
        });
      }

      // Soma a receita e a quantidade vendida no período
      let receitaItem = vendas.reduce((acc, v) => acc + v.valorTotal, 0);
      let qtdVendidaItem = vendas.reduce((acc, v) => acc + v.quantidade, 0);

      receitaTotalPeriodo += receitaItem;
      obj.receitaNoPeriodo = receitaItem;
      obj.qtdVendidaNoPeriodo = qtdVendidaItem;
      
      return obj;
    });

    res.status(200).json({
      itens: itensFormatados,
      receitaTotal: receitaTotalPeriodo
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// NOVA FUNÇÃO: Regista a Venda
exports.registrarVenda = async (req, res) => {
  try {
    const { quantidade } = req.body;
    const item = await EstoqueMaterial.findById(req.params.id);
    
    if (!item) return res.status(404).json({ message: 'Artigo não encontrado.' });
    if (item.quantidade < quantidade) return res.status(400).json({ message: 'Stock insuficiente para esta venda!' });

    const valorDaVenda = quantidade * (item.precoVenda || 0);

    // 1. Desconta no Stock
    item.quantidade -= quantidade;
    
    // 2. Regista a Venda no Histórico
    item.historicoVendas.push({
      quantidade: quantidade,
      valorTotal: valorDaVenda
    });

    await item.save();
    res.status(200).json({ message: 'Venda registada com sucesso!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
