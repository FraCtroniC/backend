/** Modelo Sequelize de auditoria. */
module.exports = (sequelize, DataTypes) => {
  const AuditLog = sequelize.define('AuditLog', {
    id_log: { 
      type: DataTypes.UUID, 
      primaryKey: true, 
      defaultValue: DataTypes.UUIDV4 
    },
    id_user: { 
      type: DataTypes.UUID, 
      allowNull: false,
      references: {
        model: 'user_account',
        key: 'id_user'
      }
    },
    action: { 
      type: DataTypes.ENUM('INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'), 
      allowNull: false 
    },
    table_affected: { 
      type: DataTypes.STRING(50), 
      allowNull: false 
    },
    record_id: { 
      type: DataTypes.STRING, // Se deja STRING por si el ID afectado es UUID o INT
      allowNull: false 
    },
    old_value: { 
      type: DataTypes.TEXT // JSON.stringify del objeto antes del cambio
    },
    new_value: { 
      type: DataTypes.TEXT // JSON.stringify del objeto después del cambio
    },
    created_at: { 
      type: DataTypes.DATE, 
      defaultValue: DataTypes.NOW 
    },
  }, {
    tableName: 'audit_log',
    timestamps: false,
  });

  return AuditLog;
};