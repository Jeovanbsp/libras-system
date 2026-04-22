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
    
    if (req.user && req.user.role === 'admin_restrito' && (role === 'admin' || role === 'admin_restrito')) {
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
            },
            redirectUrl: user.role === 'professor' ? '/professor/cursos' : null
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
            subject: 'Recuperação de Senha - Libras Salvador',
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #004aad;">Libras Salvador</h2>
                <p>Olá ${user.nome},</p>
                <p>Você solicitou a recuperação de senha. Clique no botão abaixo para criar uma nova senha:</p>
                <a href="${resetUrl}" style="display: inline-block; background: #004aad; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">
                    Criar Nova Senha
                </a>
                <p style="color: #666; font-size: 12px;">Se você não solicitou isso, pode ignorar este email.</p>
            </div>
            `
        };

        await transporter.sendMail(mailOptions);
        res.json({ message: "E-mail de recuperação enviado!" });
    } catch (err) {
        console.error("Erro ao enviar email:", err);
        res.status(500).json({ error: "Erro ao enviar e-mail. Tente novamente mais tarde." });
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
