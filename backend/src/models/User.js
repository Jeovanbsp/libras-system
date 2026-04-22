const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    required: true, 
    enum: ['admin', 'admin_restrito', 'aluno', 'professor'],
    default: 'aluno' 
  },
  cursosMatriculados: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Curso' 
  }],
  materiaisConcluidos: [{ 
    type: mongoose.Schema.Types.ObjectId 
  }],
  turma: { type: String },
  
  // Campos de investimento do aluno
  modalidade: { 
    type: String, 
    enum: ['Virtual', 'Presencial', ''],
    default: '' 
  },
  valorTotalCurso: { type: Number, default: 0 },
  apostila: { 
    type: String, 
    enum: ['Digital', 'Impressa', 'Nenhuma', ''],
    default: '' 
  },
  combo: { type: Boolean, default: false },
  statusPagamento: { 
    type: String, 
    enum: ['Pendente', 'Pago', ''],
    default: '' 
  },
  
  primeiroAcesso: { type: Boolean, default: true },
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, { timestamps: true });

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);