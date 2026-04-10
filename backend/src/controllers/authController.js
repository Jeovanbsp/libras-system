const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const transporter = require('../config/mailer');

exports.register = async (req, res) => {
    const { nome, email, password, role, turma } = req.body;
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
            turma: turma || ''
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
                primeiroAcesso: user.primeiroAcesso // Enviado para o Front
            }
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
        if (!user) return res.status(404).json({ message: "E-mail não cadastrado no sistema." });

        const token = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000;
        await user.save();
        
        const resetUrl = `https://librasalvador.vercel.app/reset-password/${token}`;

        const mailOptions = {
            from: `"Libras Salvador" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: 'Recuperação de Senha - Libras Salvador',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
                    <h2 style="color: #004aad; text-align: center;">Recuperação de Senha</h2>
                    <p style="color: #333; font-size: 16px;">Olá, <strong>${user.nome}</strong>!</p>
                    <p style="color: #333; font-size: 16px;">Recebemos um pedido para redefinir a senha da sua conta no sistema Libras Salvador.</p>
                    <p style="color: #333; font-size: 16px;">Clique no botão abaixo para criar uma nova senha:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" style="background-color: #004aad; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Redefinir Minha Senha</a>
                    </div>
                    <p style="color: #64748b; font-size: 14px;">Este link é válido por 1 hora. Se não solicitou esta alteração, por favor, ignore este e-mail.</p>
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                    <p style="color: #64748b; font-size: 12px; text-align: center;">Equipa Libras Salvador</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        res.json({ message: "E-mail de recuperação enviado com sucesso! Verifique a sua caixa de entrada." });
    } catch (err) {
        console.error("Erro ao enviar e-mail:", err);
        res.status(500).json({ error: "Erro ao tentar enviar o e-mail. Tente novamente mais tarde." });
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
        
        if (!user) return res.status(400).json({ message: "O link é inválido ou já expirou." });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        user.primeiroAcesso = false; // Retira flag de primeiro acesso

        await user.save();
        res.json({ message: "Senha atualizada com sucesso! Já pode fazer login." });
    } catch (err) {
        console.error("Erro no reset de senha:", err);
        res.status(500).json({ error: "Erro ao tentar redefinir a senha." });
    }
};

// NOVO: Usado para o utilizador que acabou de fazer login no primeiro acesso
exports.updatePassword = async (req, res) => {
    try {
        const userId = req.user?.id || req.userId;
        const { password } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "Utilizador não encontrado." });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.primeiroAcesso = false; // Desbloqueia o utilizador

        await user.save();
        res.json({ message: "Senha salva com sucesso!" });
    } catch (err) {
        res.status(500).json({ error: "Erro ao atualizar a senha." });
    }
};  