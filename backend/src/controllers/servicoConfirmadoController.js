const ServicoConfirmado = require('../models/ServicoConfirmado');
const Financeiro = require('../models/Financeiro');

// Cadastrar um novo serviço e lançar entrada financeira
exports.criarServico = async (req, res) => {
  try {
    const novoServico = await ServicoConfirmado.create(req.body);

    // Integração automática com o Fluxo de Caixa da Empresa
    if (novoServico.caixaEmpresa && novoServico.caixaEmpresa > 0) {
      await Financeiro.create({
        tipo: 'Entrada',
        descricao: `Receita B2B - Serviço/Evento: ${novoServico.tipoEvento || 'Geral'}`,
        valor: novoServico.caixaEmpresa,
        data: novoServico.dataEvento || Date.now(),
        status: 'Pago'
      });
    }

    res.status(201).json(novoServico);
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

    if (clienteId) {
      filtro.cliente = clienteId;
    }

    if (interpreteId) {
      filtro.interpretes = interpreteId; 
    }

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
    const servico = await ServicoConfirmado.findByIdAndDelete(req.params.id);
    if (!servico) {
      return res.status(404).json({ message: 'Serviço não encontrado.' });
    }
    res.status(200).json({ message: 'Serviço removido com sucesso.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};