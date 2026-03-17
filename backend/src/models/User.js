const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    required: true, 
    enum: ['admin', 'aluno'], 
    default: 'aluno' 
  },
  // Campo que guarda as matrículas do aluno
  cursosMatriculados: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Curso' 
  }],
  
  // NOVOS CAMPOS PARA REDEFINIÇÃO DE SENHA
  resetPasswordToken: String,
  resetPasswordExpires: Date

}, { timestamps: true });

// Método para comparar senhas durante o login
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Criptografar senha antes de salvar (para novos registros ou alteração de senha)
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', UserSchema);