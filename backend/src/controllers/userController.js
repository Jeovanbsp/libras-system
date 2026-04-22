const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.criarUsuario = async (req, res) => {
    try {
        const { nome, email, password, role, turma, modalidade, valorTotalCurso, apostila, combo, statusPagamento } = req.body;

        // Criptografa a senha antes de salvar
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const novoUsuario = new User({
            nome,
            email,
            password: hashedPassword,
            role,
            turma,
            modalidade,
            valorTotalCurso,
            apostila,
            combo,
            statusPagamento
        });

        await novoUsuario.save();
        res.status(201).json({ msg: "Usuário cadastrado com sucesso!" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.atualizarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, email, password } = req.body;
        
        const usuario = await User.findById(id);
        if (!usuario) {
            return res.status(404).json({ error: "Usuário não encontrado" });
        }
        
        // Atualiza nome e email
        if (nome) usuario.nome = nome;
        if (email) usuario.email = email;
        
        // Atualiza senha se fornecida
        if (password && password.length >= 6) {
            const salt = await bcrypt.genSalt(10);
            usuario.password = await bcrypt.hash(password, salt);
        }
        
        await usuario.save();
        res.json({ msg: "Usuário atualizado com sucesso!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
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