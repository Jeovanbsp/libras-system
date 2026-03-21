const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const transporter = require('../config/mailer'); // <-- Importando o enviador de e-mail

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
        if (!user) return res.status(404).json({ message: "E-mail não cadastrado no sistema." });

        const token = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // Validade de 1 hora
        await user.save();
        
        // Link que vai no e-mail apontando para o seu frontend na Vercel
        const resetUrl = `https://librasalvador.vercel.app/reset-password/${token}`;

        // Construindo o corpo do e-mail
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
                    <p style="color: #64748b; font-size: 14px;">Este link é válido por 1 hora. Se você não solicitou essa alteração, por favor, ignore este e-mail.</p>
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                    <p style="color: #64748b; font-size: 12px; text-align: center;">Equipe Libras Salvador</p>
                </div>
            `
        };

        // Dispara o e-mail
        await transporter.sendMail(mailOptions);

        res.json({ message: "E-mail de recuperação enviado com sucesso! Verifique sua caixa de entrada." });
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

        await user.save();
        res.json({ message: "Senha atualizada com sucesso! Você já pode fazer login." });
    } catch (err) {
        console.error("Erro no reset de senha:", err);
        res.status(500).json({ error: "Erro ao tentar redefinir a senha." });
    }
};