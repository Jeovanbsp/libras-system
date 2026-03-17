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
  cursosMatriculados: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Curso' 
  }],
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, { timestamps: true });

// Método para comparar senhas no login
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);