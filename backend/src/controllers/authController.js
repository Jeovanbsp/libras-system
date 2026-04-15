const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const transporter = require('../config/mailer');

// Retorna os dados do usuário autenticado
exports.getMe = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id || req.userId;
        const user = await User.findById(userId).select('-password');
        
        if (!user) {
            return res.status(404).json({ msg: "Utilizador não encontrado" });
        }
        
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: "Erro ao buscar dados do utilizador" });
    }
};

exports.register = async (req, res) => {
    const { nome, email, password, role, turma } = req.body;
    
    if (req.user && req.user.role === 'admin_restrito' && role === 'admin') {
        return res.status(403).json({ msg: "Operação não permitida para o seu nível de acesso." });
    }

    try {
        let userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ msg: "Utilizador já existe" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            nome,
            email,
            password: hashedPassword,
            role: role || 'aluno',
            turma: turma || '',
            primeiroAcesso: true
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

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: "Senha incorreta" });

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            token,
            user: { 
                id: user._id, 
                nome: user.nome, 
                role: user.role,
                primeiroAcesso: user.primeiroAcesso 
            }
        });
    } catch (err) {
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
        
        const frontendUrl = process.env.FRONTEND_URL || 'https://librasalvador.vercel.app';
        const resetUrl = `${frontendUrl}/reset-password/${token}`;
        const mailOptions = {
            from: `"Libras Salvador" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: 'Recuperação de Senha',
            html: `<p>Olá ${user.nome}, clique <a href="${resetUrl}">aqui</a> para redefinir sua senha.</p>`
        };

        await transporter.sendMail(mailOptions);
        res.json({ message: "E-mail enviado!" });
    } catch (err) {
        res.status(500).json({ error: "Erro ao enviar e-mail." });
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
        if (!user) return res.status(400).json({ message: "Token inválido ou expirado." });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        user.primeiroAcesso = false;

        await user.save();
        res.json({ message: "Senha redefinida com sucesso!" });
    } catch (err) {
        res.status(500).json({ error: "Erro no reset." });
    }
};

exports.updatePassword = async (req, res) => {
    try {
        const userId = req.user?.id || req.userId;
        const { password } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "Utilizador não encontrado." });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.primeiroAcesso = false;

        await user.save();
        res.json({ message: "Senha definitiva salva!" });
    } catch (err) {
        res.status(500).json({ error: "Erro ao atualizar." });
    }
};
