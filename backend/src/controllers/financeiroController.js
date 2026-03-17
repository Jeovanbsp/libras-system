// backend/src/controllers/financeiroController.js

exports.calcularOrcamento = (req, res) => {
    try {
        const { horas, valorHora, logistica, material, imposto, margem } = req.body;

        // 1. Calcula o Subtotal Bruto
        const subtotalBruto = (horas * valorHora) + logistica + material;

        // 2. Calcula o Valor Final "Por Dentro" (conforme o escopo)
        // A fórmula: G2 / (1 - E2 - F2)
        const divisor = 1 - (imposto + margem);
        
        if (divisor <= 0) {
            return res.status(400).json({ error: "A soma do imposto e margem não pode ser maior que 100%" });
        }

        const valorFinal = subtotalBruto / divisor;

        res.json({
            subtotalBruto: subtotalBruto.toFixed(2),
            valorFinal: valorFinal.toFixed(2),
            lucroEstimado: (valorFinal * margem).toFixed(2),
            impostosARecolher: (valorFinal * imposto).toFixed(2)
        });
    } catch (error) {
        res.status(500).json({ error: "Erro ao calcular orçamento" });
    }
};