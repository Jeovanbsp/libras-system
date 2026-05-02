const mongoose = require('mongoose');

const financeiroSchema = new mongoose.Schema(
  {
    // ==========================================
    // INFORMAÇÕES DA EMPRESA SOLICITANTE
    // ==========================================
    empresa: {
      type: String,
      required: [true, 'Empresa é obrigatória'],
      enum: ['SINDAUTO', 'BOTICÁRIO', 'OUTRA'],
      trim: true
    },
    cnpj: {
      type: String,
      trim: true
    },
    solicitante: {
      type: String,
      required: [true, 'Solicitante é obrigatório'],
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    contato: {
      type: String,
      trim: true
    },

    // ==========================================
    // INFORMAÇÕES DO EVENTO
    // ==========================================
    tematica: {
      type: String,
      required: [true, 'Temática é obrigatória'],
      trim: true
    },
    evento: {
      type: String,
      required: [true, 'Evento é obrigatório'],
      trim: true
    },
    tipoEvento: {
      type: String,
      enum: ['Presencial', 'Virtual', 'Híbrido', ''],
      default: ''
    },

    // ==========================================
    // DATAS E HORÁRIOS
    // ==========================================
    dataInicial: {
      type: Date,
      required: [true, 'Data inicial é obrigatória']
    },
    dataFinal: Date,
    horaInicio: String,
    horaTermino: String,

    // ==========================================
    // DETALHES DO SERVIÇO
    // ==========================================
    quantidadeHoras: {
      type: Number,
      required: [true, 'Quantidade de horas é obrigatória'],
      min: [0, 'Horas não podem ser negativas']
    },
    interpretes: {
      type: String,
      required: [true, 'Intérpretes é obrigatório'],
      trim: true
    },
    plataforma: {
      type: String,
      trim: true
    },

    // ==========================================
    // VALORES FINANCEIROS
    // ==========================================
    precoTotal: {
      type: Number,
      required: [true, 'Preço total é obrigatório'],
      min: [0, 'Preço não pode ser negativo']
    },
    transporte: {
      type: Number,
      default: 0,
      min: [0, 'Transporte não pode ser negativo']
    },
    impostos: {
      type: Number,
      default: 0,
      min: [0, 'Impostos não podem ser negativos']
    },
    pagosInterpretes: {
      type: Number,
      default: 0,
      min: [0, 'Pago intérpretes não pode ser negativo']
    },
    caixaEmpresa: {
      type: Number,
      default: 0,
      min: [0, 'Caixa empresa não pode ser negativo']
    },

    // ==========================================
    // PERÍODO
    // ==========================================
    mes: {
      type: String,
      required: [true, 'Mês é obrigatório'],
      enum: [
        'janeiro',
        'fevereiro',
        'março',
        'abril',
        'maio',
        'junho',
        'julho',
        'agosto',
        'setembro',
        'outubro',
        'novembro',
        'dezembro'
      ]
    },
    ano: {
      type: Number,
      required: [true, 'Ano é obrigatório'],
      min: [2000, 'Ano inválido']
    },

    // ==========================================
    // COMPLEMENTOS
    // ==========================================
    observacao: {
      type: String,
      trim: true
    },
    previsaoPagamento: Date,
    pagoEm: Date,
    outros: {
      type: String,
      trim: true
    },
    
    // ==========================================
    // DADOS PARA ORÇAMENTO
    // ==========================================
    prazoEntrega: {
      type: String,
      trim: true
    },
    politicaCancelamento: {
      type: String,
      trim: true
    },
    requisitos: {
      type: String,
      trim: true
    },
    dadosBancarios: {
      type: String,
      trim: true
    },
    formaPagamento: {
      type: String,
      trim: true
    },
    parcelamento: {
      type: String,
      trim: true
    },
    
    status: {
      type: String,
      enum: ['pendente', 'pago', 'cancelado'],
      default: 'pendente'
    },

    // ==========================================
    // RASTREAMENTO
    // ==========================================
    criadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    atualizadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    servicoOrigem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServicoConfirmado'
    }
  },
  { 
    timestamps: true,
    collection: 'financeiro'
  }
);

// ==========================================
// ÍNDICES PARA PERFORMANCE
// ==========================================
financeiroSchema.index({ empresa: 1, mes: 1, ano: 1 });
financeiroSchema.index({ dataInicial: 1 });
financeiroSchema.index({ status: 1 });
financeiroSchema.index({ mes: 1, ano: 1 });
financeiroSchema.index({ empresa: 1 });

// ==========================================
// MÉTODOS ÚTEIS
// ==========================================
financeiroSchema.methods.calcularLucro = function () {
  return this.precoTotal - (this.transporte + this.impostos + this.pagosInterpretes);
};

financeiroSchema.methods.marcarComoPago = function () {
  this.status = 'pago';
  this.pagoEm = new Date();
  return this.save();
};

financeiroSchema.statics.resumoMes = async function (mes, ano) {
  const eventos = await this.find({ mes, ano });
  return {
    precoTotal: eventos.reduce((s, e) => s + (e.precoTotal || 0), 0),
    totalHoras: eventos.reduce((s, e) => s + (e.quantidadeHoras || 0), 0),
    transporte: eventos.reduce((s, e) => s + (e.transporte || 0), 0),
    impostos: eventos.reduce((s, e) => s + (e.impostos || 0), 0),
    pagosInterpretes: eventos.reduce((s, e) => s + (e.pagosInterpretes || 0), 0),
    caixaEmpresa: eventos.reduce((s, e) => s + (e.caixaEmpresa || 0), 0),
    totalEventos: eventos.length
  };
};

module.exports = mongoose.model('Financeiro', financeiroSchema);
