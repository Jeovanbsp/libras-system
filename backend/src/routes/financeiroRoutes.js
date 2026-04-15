const express = require('express');
const router = express.Router();
const Financeiro = require('../models/Financeiro');

// Middleware de autenticação (assume que existe)
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }
  next();
};

// ==========================================
// GET: Listar todos os eventos financeiros
// ==========================================
router.get('/', async (req, res) => {
  try {
    const { mes, ano, empresa, status } = req.query;
    let query = {};

    if (mes && mes !== '') {
      query.mes = mes;
    }
    if (ano && ano !== '') {
      query.ano = parseInt(ano);
    }
    if (empresa && empresa !== '') {
      query.empresa = empresa;
    }
    if (status && status !== '') {
      query.status = status;
    }

    const financeiro = await Financeiro.find(query)
      .sort({ dataInicial: -1 })
      .populate('criadoPor', 'nome email')
      .populate('atualizadoPor', 'nome email');

    res.json(financeiro);
  } catch (error) {
    console.error('Erro ao listar financeiro:', error);
    res.status(500).json({ error: 'Erro ao listar eventos', details: error.message });
  }
});

// ==========================================
// GET: Resumo do mês especificado
// ==========================================
router.get('/resumo/:mes/:ano', async (req, res) => {
  try {
    const { mes, ano } = req.params;

    if (!mes || !ano) {
      return res.status(400).json({ error: 'Mês e ano são obrigatórios' });
    }

    const eventos = await Financeiro.find({
      mes: mes,
      ano: parseInt(ano)
    });

    const resumo = {
      mes,
      ano: parseInt(ano),
      precoTotal: eventos.reduce((s, e) => s + (e.precoTotal || 0), 0),
      totalHoras: eventos.reduce((s, e) => s + (e.quantidadeHoras || 0), 0),
      transporte: eventos.reduce((s, e) => s + (e.transporte || 0), 0),
      impostos: eventos.reduce((s, e) => s + (e.impostos || 0), 0),
      pagosInterpretes: eventos.reduce((s, e) => s + (e.pagosInterpretes || 0), 0),
      caixaEmpresa: eventos.reduce((s, e) => s + (e.caixaEmpresa || 0), 0),
      totalEventos: eventos.length,
      eventosPendentes: eventos.filter(e => e.status === 'pendente').length,
      eventosPagos: eventos.filter(e => e.status === 'pago').length
    };

    res.json(resumo);
  } catch (error) {
    console.error('Erro ao obter resumo:', error);
    res.status(500).json({ error: 'Erro ao obter resumo', details: error.message });
  }
});

// ==========================================
// GET: Resumo do mês atual
// ==========================================
router.get('/resumo-mes-atual', async (req, res) => {
  try {
    const agora = new Date();
    const meses = [
      'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ];
    const mes = meses[agora.getMonth()];
    const ano = agora.getFullYear();

    const eventos = await Financeiro.find({ mes, ano });

    const resumo = {
      mes,
      ano,
      precoTotal: eventos.reduce((s, e) => s + (e.precoTotal || 0), 0),
      totalHoras: eventos.reduce((s, e) => s + (e.quantidadeHoras || 0), 0),
      transporte: eventos.reduce((s, e) => s + (e.transporte || 0), 0),
      impostos: eventos.reduce((s, e) => s + (e.impostos || 0), 0),
      pagosInterpretes: eventos.reduce((s, e) => s + (e.pagosInterpretes || 0), 0),
      caixaEmpresa: eventos.reduce((s, e) => s + (e.caixaEmpresa || 0), 0),
      totalEventos: eventos.length
    };

    res.json(resumo);
  } catch (error) {
    console.error('Erro ao obter resumo do mês atual:', error);
    res.status(500).json({ error: 'Erro ao obter resumo', details: error.message });
  }
});

// ==========================================
// GET: Detalhes de um evento específico
// ==========================================
router.get('/:id', async (req, res) => {
  try {
    const evento = await Financeiro.findById(req.params.id)
      .populate('criadoPor', 'nome email')
      .populate('atualizadoPor', 'nome email');

    if (!evento) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }

    res.json(evento);
  } catch (error) {
    console.error('Erro ao obter evento:', error);
    res.status(500).json({ error: 'Erro ao obter evento', details: error.message });
  }
});

// ==========================================
// POST: Criar novo evento financeiro
// ==========================================
router.post('/', async (req, res) => {
  try {
    const {
      empresa,
      solicitante,
      email,
      contato,
      tematica,
      evento,
      tipoEvento,
      dataInicial,
      dataFinal,
      horaInicio,
      horaTermino,
      quantidadeHoras,
      interpretes,
      plataforma,
      precoTotal,
      transporte,
      impostos,
      pagosInterpretes,
      caixaEmpresa,
      mes,
      ano,
      observacao,
      previsaoPagamento,
      pagoEm,
      outros
    } = req.body;

    // Validações básicas
    if (!empresa || !solicitante || !tematica || !evento || !quantidadeHoras || !interpretes || !precoTotal || !mes || !ano) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }

    const novoEvento = new Financeiro({
      empresa,
      solicitante,
      email,
      contato,
      tematica,
      evento,
      tipoEvento,
      dataInicial,
      dataFinal,
      horaInicio,
      horaTermino,
      quantidadeHoras,
      interpretes,
      plataforma,
      precoTotal,
      transporte: transporte || 0,
      impostos: impostos || 0,
      pagosInterpretes: pagosInterpretes || 0,
      caixaEmpresa: caixaEmpresa || 0,
      mes,
      ano,
      observacao,
      previsaoPagamento,
      pagoEm,
      outros
    });

    await novoEvento.save();
    res.status(201).json({
      message: 'Evento criado com sucesso',
      evento: novoEvento
    });
  } catch (error) {
    console.error('Erro ao criar evento:', error);
    res.status(400).json({ error: 'Erro ao criar evento', details: error.message });
  }
});

// ==========================================
// PUT: Atualizar evento financeiro
// ==========================================
router.put('/:id', async (req, res) => {
  try {
    const evento = await Financeiro.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('criadoPor', 'nome email');

    if (!evento) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }

    res.json({
      message: 'Evento atualizado com sucesso',
      evento
    });
  } catch (error) {
    console.error('Erro ao atualizar evento:', error);
    res.status(400).json({ error: 'Erro ao atualizar evento', details: error.message });
  }
});

// ==========================================
// DELETE: Remover evento financeiro
// ==========================================
router.delete('/:id', async (req, res) => {
  try {
    const evento = await Financeiro.findByIdAndDelete(req.params.id);

    if (!evento) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }

    res.json({
      message: 'Evento removido com sucesso',
      evento
    });
  } catch (error) {
    console.error('Erro ao remover evento:', error);
    res.status(500).json({ error: 'Erro ao remover evento', details: error.message });
  }
});

// ==========================================
// GET: Relatório por empresa
// ==========================================
router.get('/relatorio/empresa/:empresa', async (req, res) => {
  try {
    const { empresa } = req.params;
    const { mes, ano } = req.query;

    let query = { empresa };
    if (mes && mes !== '') {
      query.mes = mes;
    }
    if (ano && ano !== '') {
      query.ano = parseInt(ano);
    }

    const eventos = await Financeiro.find(query).sort({ dataInicial: -1 });

    const relatorio = {
      empresa,
      filtros: { mes: mes || 'Todos', ano: ano || 'Todos' },
      totalEventos: eventos.length,
      precoTotal: eventos.reduce((s, e) => s + (e.precoTotal || 0), 0),
      totalHoras: eventos.reduce((s, e) => s + (e.quantidadeHoras || 0), 0),
      transporte: eventos.reduce((s, e) => s + (e.transporte || 0), 0),
      impostos: eventos.reduce((s, e) => s + (e.impostos || 0), 0),
      pagosInterpretes: eventos.reduce((s, e) => s + (e.pagosInterpretes || 0), 0),
      caixaEmpresa: eventos.reduce((s, e) => s + (e.caixaEmpresa || 0), 0),
      eventos
    };

    res.json(relatorio);
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório', details: error.message });
  }
});

// ==========================================
// PATCH: Atualizar status do pagamento
// ==========================================
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pendente', 'pago', 'cancelado'].includes(status)) {
      return res.status(400).json({ error: 'Status inválido. Use: pendente, pago ou cancelado' });
    }

    const evento = await Financeiro.findByIdAndUpdate(
      req.params.id,
      {
        status,
        pagoEm: status === 'pago' ? new Date() : null
      },
      { new: true }
    );

    if (!evento) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }

    res.json({
      message: 'Status atualizado com sucesso',
      evento
    });
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({ error: 'Erro ao atualizar status', details: error.message });
  }
});

// ==========================================
// GET: Relatório financeiro completo
// ==========================================
router.get('/relatorios/completo', async (req, res) => {
  try {
    const { mesInicio, anoInicio, mesFim, anoFim } = req.query;

    let query = {};

    if (mesInicio && anoInicio) {
      const dataInicio = new Date(`${anoInicio}-${new Date(`${mesInicio} 1`).getMonth() + 1}-01`);
      const dataFim = new Date(`${anoFim || anoInicio}-${new Date(`${mesFim || mesInicio} 1`).getMonth() + 2}-01`);
      query.dataInicial = { $gte: dataInicio, $lt: dataFim };
    }

    const eventos = await Financeiro.find(query).sort({ dataInicial: -1 });

    const relatorio = {
      periodo: `${mesInicio || 'Início'} ${anoInicio || ''} a ${mesFim || 'Fim'} ${anoFim || ''}`,
      totalEventos: eventos.length,
      precoTotal: eventos.reduce((s, e) => s + (e.precoTotal || 0), 0),
      totalHoras: eventos.reduce((s, e) => s + (e.quantidadeHoras || 0), 0),
      transporte: eventos.reduce((s, e) => s + (e.transporte || 0), 0),
      impostos: eventos.reduce((s, e) => s + (e.impostos || 0), 0),
      pagosInterpretes: eventos.reduce((s, e) => s + (e.pagosInterpretes || 0), 0),
      caixaEmpresa: eventos.reduce((s, e) => s + (e.caixaEmpresa || 0), 0),
      porEmpresa: {
        SINDAUTO: eventos.filter(e => e.empresa === 'SINDAUTO').length,
        BOTICÁRIO: eventos.filter(e => e.empresa === 'BOTICÁRIO').length,
        OUTRA: eventos.filter(e => e.empresa === 'OUTRA').length
      },
      porStatus: {
        pendente: eventos.filter(e => e.status === 'pendente').length,
        pago: eventos.filter(e => e.status === 'pago').length,
        cancelado: eventos.filter(e => e.status === 'cancelado').length
      },
      eventos
    };

    res.json(relatorio);
  } catch (error) {
    console.error('Erro ao gerar relatório completo:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório', details: error.message });
  }
});

module.exports = router;