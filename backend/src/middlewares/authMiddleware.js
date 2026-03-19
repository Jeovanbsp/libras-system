const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // Tenta pegar o token do cabeçalho 'Authorization'
    const authHeader = req.header('Authorization');

    if (!authHeader) {
        return res.status(401).json({ msg: "Acesso negado. Token não fornecido." });
    }

    // O padrão Bearer envia "Bearer [token]", então precisamos separar a palavra do código
    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ msg: "Token malformado." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ msg: "Token inválido ou expirado." });
    }
};