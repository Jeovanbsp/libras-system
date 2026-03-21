const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', // Definindo o servidor expressamente
  port: 465,
  secure: true, // Usa conexão SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  // A MÁGICA ESTÁ AQUI:
  // Essa configuração extra contorna os bloqueios e problemas de rota/IPv6 do Render
  tls: {
    rejectUnauthorized: false
  }
});

module.exports = transporter;