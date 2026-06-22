const { Notification } = require('../models');

const notificationController = {
  // Obtener todas las notificaciones del usuario autenticado
  list: async (req, res, next) => {
    try {
      const userId = req.auth.sub || req.auth.id || req.auth.id_user || req.auth.userId;
      const notifications = await Notification.findAll({
        where: { id_user: userId },
        order: [['created_at', 'DESC']],
        limit: 50 // Por seguridad, obtener las últimas 50
      });
      res.json(notifications);
    } catch (error) {
      next(error);
    }
  },

  // Marcar una notificación como leída
  markAsRead: async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.auth.sub || req.auth.id || req.auth.id_user || req.auth.userId;

      const notification = await Notification.findOne({
        where: { id_notification: id, id_user: userId }
      });

      if (!notification) {
        return res.status(404).json({ message: 'Notificación no encontrada' });
      }

      notification.is_read = true;
      await notification.save();

      res.json(notification);
    } catch (error) {
      next(error);
    }
  },

  // Marcar todas como leídas
  markAllAsRead: async (req, res, next) => {
    try {
      const userId = req.auth.sub || req.auth.id || req.auth.id_user || req.auth.userId;

      await Notification.update(
        { is_read: true },
        { where: { id_user: userId, is_read: false } }
      );

      res.json({ message: 'Todas las notificaciones marcadas como leídas' });
    } catch (error) {
      next(error);
    }
  },

  // Eliminar una notificación
  remove: async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.auth.sub || req.auth.id || req.auth.id_user || req.auth.userId;

      const deleted = await Notification.destroy({
        where: { id_notification: id, id_user: userId }
      });

      if (!deleted) {
        return res.status(404).json({ message: 'Notificación no encontrada' });
      }

      res.json({ message: 'Notificación eliminada' });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = notificationController;
