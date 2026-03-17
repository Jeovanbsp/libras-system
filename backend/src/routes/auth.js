const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  // Use uma string simples se não tiver .env configurado
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', { expiresIn: '30d' });
};

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user) {
      // Compara a senha direta (123) OU a criptografada (matchPassword)
      const isMatch = (user.password === password) || 
                      (user.matchPassword && await user.matchPassword(password));

      if (isMatch) {
        return res.json({
          _id: user._id,
          nome: user.nome,
          email: user.email,
          role: user.role, // "admin" ou "aluno"
          token: generateToken(user._id),
        });
      }
    }
    
    res.status(401).json({ message: 'Credenciais inválidas' });

  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

module.exports = router;