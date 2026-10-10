/** Modelo Sequelize de auditoria (Mapeado a th_audit). */
module.exports = (sequelize, DataTypes) => {
  const AuditLog = sequelize.define('AuditLog', {
    id_log: { 
      type: DataTypes.UUID, 
      primaryKey: true, 
      defaultValue: DataTypes.UUIDV4,
      field: 'audit_id',
    },
    id_user: { 
      type: DataTypes.UUID, 
      allowNull: false,
      field: 'users_id',
      references: {
        model: 'tm_users',
        key: 'users_id'
      }
    },
    action: { 
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'audit_ac',
    },
    table_affected: { 
      type: DataTypes.STRING(50), 
      allowNull: false,
      field: 'audit_tb',
    },
    record_id: { 
      type: DataTypes.STRING, // Se deja STRING por si el ID afectado es UUID o INT
      allowNull: false,
      field: 'audit_ri',
    },
    old_value: { 
      type: DataTypes.TEXT, // JSON.stringify del objeto antes del cambio
      field: 'audit_ov',
    },
    new_value: { 
      type: DataTypes.TEXT, // JSON.stringify del objeto después del cambio
      field: 'audit_nv',
    },
    created_at: { 
      type: DataTypes.DATE, 
      defaultValue: DataTypes.NOW,
      field: 'audit_ca',
    },
  }, {
    tableName: 'th_audit',
    timestamps: false,
  });

  return AuditLog;
};