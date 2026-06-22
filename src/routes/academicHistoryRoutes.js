const express = require('express');
const router = express.Router();
const academicHistoryController = require('../controllers/academicHistoryController');
// const { validateZod } = require('../middlewares/validateZod');

// Endpoint to get academic history by student document ID
router.get('/:documentId', academicHistoryController.getHistory);

module.exports = router;
