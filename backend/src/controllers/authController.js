const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // Módulo nativo para gerar tokens seguros

// LOGIN ORIGINAL
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: "Usuário não encontrado" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: "Senha incorreta" });

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            token,
            user: { id: user._id, nome: user.nome, role: user.role }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 1. SOLICITAR REDEFINIÇÃO (Esqueci a Senha)
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "E-mail não cadastrado." });

        // Gerar token aleatório de 20 caracteres
        const token = crypto.randomBytes(20).toString('hex');

        // Definir validade (1 hora a partir de agora)
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; 

        await user.save();

        // LOG PARA TESTE (No futuro, aqui enviamos o e-mail via Nodemailer)
        console.log(`\n--- RECUPERAÇÃO DE SENHA ---`);
        console.log(`Usuário: ${user.nome}`);
        console.log(`Link: http://localhost:5173/reset-password/${token}`);
        console.log(`---------------------------\n`);

        res.json({ message: "Se o e-mail existir, um link de recuperação foi enviado." });
    } catch (err) {
        res.status(500).json({ error: "Erro ao processar solicitação." });
    }
};

// 2. RESETAR SENHA REALMENTE
exports.resetPassword = async (req, res) => {
    const { password } = req.body;
    const { token } = req.params;

    try {
        // Busca usuário que tenha o token E que o token não tenha expirado ($gt = maior que agora)
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "O link de recuperação é inválido ou expirou." });
        }

        // Atualiza a senha (o middleware no User.js vai criptografar automaticamente)
        user.password = password;
        
        // Limpa os campos de recuperação
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.json({ message: "Senha atualizada com sucesso! Você já pode fazer login." });
    } catch (err) {
        res.status(500).json({ error: "Erro ao redefinir senha." });
    }
};