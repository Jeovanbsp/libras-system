const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Busca usuário pelo email
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: "Usuário não encontrado" });

        // Verifica se a senha bate
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: "Senha incorreta" });

        // Cria o Token
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