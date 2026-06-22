const { Notification, Student, Teacher, User, Role } = require('../models');
const socket = require('../socket');

class NotificationService {
  /**
   * Enviar notificación directamente a un id de usuario
   */
  static async notifyUser(userId, title, message, type = 'info', link = null) {
    if (!userId) return null;
    try {
      const newNotification = await Notification.create({
        id_user: userId,
        title,
        message,
        type,
        link
      });

      try {
        const io = socket.getIO();
        if (io) {
          io.to(`user_${userId}`).emit('new_notification', newNotification);
        }
      } catch (err) {
        console.error('Socket not available for notification:', err);
      }

      return newNotification;
    } catch (err) {
      console.error('Error notifying user:', err);
      return null;
    }
  }

  /**
   * Buscar el id_user de un estudiante y notificar
   */
  static async notifyStudent(studentId, title, message, type = 'info', link = null) {
    try {
      const student = await Student.findByPk(studentId);
      if (student && student.id_user) {
        return await this.notifyUser(student.id_user, title, message, type, link);
      }
    } catch (err) {
      console.error('Error notifying student:', err);
    }
  }

  /**
   * Buscar el id_user de un docente y notificar
   */
  static async notifyTeacher(teacherId, title, message, type = 'info', link = null) {
    try {
      const teacher = await Teacher.findByPk(teacherId);
      if (teacher && teacher.id_user) {
        return await this.notifyUser(teacher.id_user, title, message, type, link);
      }
    } catch (err) {
      console.error('Error notifying teacher:', err);
    }
  }

  /**
   * Notificar a todos los administradores
   */
  static async notifyAdmins(title, message, type = 'info', link = null) {
    try {
      const adminRole = await Role.findOne({ where: { name_role: 'Admin' } });
      if (!adminRole) return;

      const admins = await User.findAll({ where: { id_role: adminRole.id_role } });
      const promises = admins.map(admin => 
        this.notifyUser(admin.id_user || admin.id, title, message, type, link)
      );
      
      await Promise.allSettled(promises);
    } catch (err) {
      console.error('Error notifying admins:', err);
    }
  }

  /**
   * Notificar a TODOS los usuarios (útil para anuncios globales)
   */
  static async notifyAllUsers(title, message, type = 'info', link = null) {
    try {
      const users = await User.findAll();
      const promises = users.map(user => 
        this.notifyUser(user.id_user || user.id, title, message, type, link)
      );
      await Promise.allSettled(promises);
    } catch (err) {
      console.error('Error notifying all users:', err);
    }
  }
}

module.exports = NotificationService;
