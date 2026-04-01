const ServicoConfirmado = require('../models/ServicoConfirmado');

// Cadastrar um novo serviço
exports.criarServico = async (req, res) => {
  try {
    const novoServico = await ServicoConfirmado.create(req.body);
    res.status(201).json(novoServico);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Listar serviços (com filtros de período, cliente ou intérprete)
exports.listarServicos = async (req, res) => {
  try {
    const { dataInicio, dataFim, clienteId, interpreteId } = req.query;
    let filtro = {};

    // Filtro por período (Data de Início e Fim)
    if (dataInicio || dataFim) {
      filtro.dataEvento = {};
      if (dataInicio) filtro.dataEvento.$gte = new Date(dataInicio);
      if (dataFim) filtro.dataEvento.$lte = new Date(dataFim);
    }

    // Filtro por Cliente B2B específico
    if (clienteId) {
      filtro.cliente = clienteId;
    }

    // Filtro por Intérprete específico
    if (interpreteId) {
      filtro.interpretes = interpreteId; // Como interpretes é um array, o mongoose busca se o ID está dentro dele
    }

    // O .populate('cliente') e .populate('interpretes') traz os dados reais da empresa e do profissional em vez de só o ID
    const servicos = await ServicoConfirmado.find(filtro)
      .populate('cliente', 'razaoSocial cnpj')
      .populate('interpretes', 'nome especialidades')
      .sort({ dataEvento: -1 });

    res.status(200).json(servicos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Excluir um serviço
exports.removerServico = async (req, res) => {
  try {
    const servico = await ServicoConfirmado.findByIdAndDelete(req.params.id);
    if (!servico) {
      return res.status(404).json({ message: 'Serviço não encontrado.' });
    }
    res.status(200).json({ message: 'Serviço removido com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};