const express = require('express');
const router = express.Router();
const apostilaController = require('../controllers/apostilaController');
const auth = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');

router.post('/cadastrar', auth, authorizeRoles('admin', 'admin_restrito'), apostilaController.cadastrarApostila);
router.get('/todos', auth, apostilaController.listarMateriais);

module.exports = router;
