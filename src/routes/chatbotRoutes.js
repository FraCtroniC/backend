const express = require('express');
const router = express.Router();
const { consultar, probar } = require('../controllers/chatbotController');

router.get('/probar', probar);
router.post('/consultar', consultar);

module.exports = router;
