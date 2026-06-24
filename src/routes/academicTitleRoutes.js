const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/academicTitleController');

router.get('/', ctrl.list);

module.exports = router;
