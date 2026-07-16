const express = require('express');
const router = express.Router();
const { consultar, probar } = require('../controllers/chatbotController');
const { chatbotLimiter } = require('../middlewares/rateLimiter');

router.get('/probar', probar);
router.post('/consultar', chatbotLimiter, consultar);

module.exports = router;
