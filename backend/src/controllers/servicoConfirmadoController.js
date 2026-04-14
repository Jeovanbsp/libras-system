const ServicoConfirmado = require('../models/ServicoConfirmado');
const Financeiro = require('../models/Financeiro');

exports.criarServico = async (req, res) => {
  try {
    const novoServico = await ServicoConfirmado.create(req.body);

    // Registar lucro automaticamente no financeiro COM a referência
    if (novoServico.caixaEmpresa && novoServico.caixaEmpresa > 0) {
      await Financeiro.create({
        tipo: 'Entrada',
        descricao: `Receita Evento: ${novoServico.tipoEvento}`,
        valor: novoServico.caixaEmpresa,
        data: novoServico.dataEvento || Date.now(),
        status: novoServico.statusPagamento || 'Pendente', // Adaptado da planilha
        servicoOrigem: novoServico._id
      });
    }

    res.status(201).json(novoServico);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.atualizarServico = async (req, res) => {
  try {
    const servicoAtualizado = await ServicoConfirmado.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    );

    if (!servicoAtualizado) return res.status(404).json({ message: "Serviço não encontrado" });

    // Atualiza o valor e o STATUS correspondente no fluxo de caixa
    if (servicoAtualizado.caixaEmpresa !== undefined) {
      await Financeiro.findOneAndUpdate(
        { servicoOrigem: servicoAtualizado._id },
        { 
          valor: servicoAtualizado.caixaEmpresa,
          descricao: `Receita Evento: ${servicoAtualizado.tipoEvento}`,
          status: servicoAtualizado.statusPagamento // Sincroniza pendente/pago
        },
        { upsert: true }
      );
    }

    res.status(200).json(servicoAtualizado);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.listarServicos = async (req, res) => {
  try {
    const { dataInicio, dataFim, clienteId, interpreteId } = req.query;
    let filtro = {};

    if (dataInicio || dataFim) {
      filtro.dataEvento = {};
      if (dataInicio) filtro.dataEvento.$gte = new Date(dataInicio);
      if (dataFim) filtro.dataEvento.$lte = new Date(dataFim);
    }
    if (clienteId) filtro.cliente = clienteId;
    if (interpreteId) filtro.interpretes = interpreteId;

    const servicos = await ServicoConfirmado.find(filtro)
      .populate('cliente', 'razaoSocial cnpj')
      .populate('interpretes', 'nome especialidades')
      .sort({ dataEvento: -1 });

    res.status(200).json(servicos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.removerServico = async (req, res) => {
  try {
    await ServicoConfirmado.findByIdAndDelete(req.params.id);
    
    // Remove também a entrada financeira para o fluxo de caixa bater
    await Financeiro.findOneAndDelete({ servicoOrigem: req.params.id });

    res.status(200).json({ message: 'Serviço e entrada financeira removidos!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};