module.exports = (sequelize, DataTypes) => {
  const AuditLog = sequelize.define('AuditLog', {
    id_log: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    id_user: { type: DataTypes.UUID, allowNull: false },
    action: { type: DataTypes.STRING(50), allowNull: false },
    table_affected: { type: DataTypes.STRING(50), allowNull: false },
    record_id: { type: DataTypes.STRING, allowNull: false },
    old_value: { type: DataTypes.TEXT },
    new_value: { type: DataTypes.TEXT },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, {
    tableName: 'audit_log',
    timestamps: false,
  });

  return AuditLog;
};
