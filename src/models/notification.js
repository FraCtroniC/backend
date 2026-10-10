/** Modelo Sequelize de notificaciones (Mapeado a tt_notif). */
module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
    id_notification: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      field: 'notif_id',
    },
    id_user: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'users_id',
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'notif_ti',
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'notif_ms',
    },
    type: {
      type: DataTypes.ENUM('info', 'success', 'warning', 'error'),
      defaultValue: 'info',
      field: 'notif_tp',
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'notif_ird',
    },
    link: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'notif_lk',
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'notif_ca',
    },
  }, {
    tableName: 'tt_notif',
    timestamps: false,
  });

  return Notification;
};
