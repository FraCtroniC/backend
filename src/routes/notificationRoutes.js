const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { requireAuth } = require('../middlewares/authMiddleware');

// Todas las rutas de notificaciones requieren autenticación
router.use(requireAuth);

router.get('/', notificationController.list);
router.put('/read-all', notificationController.markAllAsRead);
router.put('/:id/read', notificationController.markAsRead);
router.delete('/:id', notificationController.remove);

module.exports = router;
