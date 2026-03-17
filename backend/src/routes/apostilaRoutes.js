const express = require('express');
const router = express.Router();
const apostilaController = require('../controllers/apostilaController');

router.post('/cadastrar', apostilaController.cadastrarApostila);
router.get('/todos', apostilaController.listarMateriais);

module.exports = router;