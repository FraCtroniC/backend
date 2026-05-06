const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/auditLogController');

router.get('/', ctrl.list);
router.get('/:id', ctrl.get);
router.post('/', ctrl.create);

module.exports = router;
