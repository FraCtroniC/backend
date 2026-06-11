const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { requireAuth } = require('../middlewares/authMiddleware');

// Dashboard endpoints
router.get('/admin', requireAuth, dashboardController.getAdminDashboard);
router.get('/teacher', requireAuth, dashboardController.getTeacherDashboard);
router.get('/student', requireAuth, dashboardController.getStudentDashboard);

module.exports = router;
