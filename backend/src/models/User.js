const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    required: true, 
    enum: ['admin', 'admin_restrito', 'aluno'], // NOVO: admin_restrito adicionado
    default: 'aluno' 
  },
  cursosMatriculados: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Curso' 
  }],
  aulasConcluidas: [{ 
    type: mongoose.Schema.Types.ObjectId 
  }],
  // NOVO: Campo de turma para facilitar o controle
  turma: { type: String },
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, { timestamps: true });

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);