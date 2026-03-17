const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.criarUsuario = async (req, res) => {
    try {
        const { nome, email, password, role } = req.body;

        // Criptografa a senha antes de salvar
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const novoUsuario = new User({
            nome,
            email,
            password: hashedPassword,
            role
        });

        await novoUsuario.save();
        res.status(201).json({ msg: "Usuário cadastrado com sucesso!" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.listarUsuarios = async (req, res) => {
    try {
        const usuarios = await User.find().select('-password'); // Não mostra a senha na lista
        res.json(usuarios);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};