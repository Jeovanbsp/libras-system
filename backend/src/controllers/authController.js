const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

exports.register = async (req, res) => {
    const { nome, email, password, role } = req.body;
    try {
        let userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ msg: "Utilizador já existe" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            nome,
            email,
            password: hashedPassword,
            role: role || 'aluno'
        });

        await newUser.save();
        res.status(201).json({ msg: "Utilizador criado com sucesso!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: "Utilizador não encontrado" });

        // Validação estrita e segura usando Bcrypt
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
        console.error("Erro no servidor durante login:", err);
        res.status(500).json({ error: "Erro interno no servidor" });
    }
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "E-mail não cadastrado." });

        const token = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; 
        await user.save();
        
        // Em produção, isso deveria ser enviado por e-mail
        console.log(`Link de reset: https://librasalvador.vercel.app/reset-password/${token}`);
        res.json({ message: "Processo de recuperação iniciado. Verifique os logs." });
    } catch (err) {
        res.status(500).json({ error: "Erro ao processar." });
    }
};

exports.resetPassword = async (req, res) => {
    const { password } = req.body;
    const { token } = req.params;
    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });
        if (!user) return res.status(400).json({ message: "Token inválido/expirado." });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();
        res.json({ message: "Senha atualizada com sucesso!" });
    } catch (err) {
        res.status(500).json({ error: "Erro ao resetar a senha." });
    }
};