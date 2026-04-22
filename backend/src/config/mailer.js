const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Verificar conexão ao iniciar
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Erro ao configurar email:", error);
  } else {
    console.log("✅ Servidor de email pronto");
  }
});

module.exports = transporter;