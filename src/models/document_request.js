module.exports = (sequelize, DataTypes) => {
  const DocumentRequest = sequelize.define('DocumentRequest', {
    id_request: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    id_student: { type: DataTypes.INTEGER, allowNull: false },
    document_type: { type: DataTypes.STRING(50), allowNull: false },
    request_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    status: { type: DataTypes.ENUM('Pendiente','Generado','Rechazado'), allowNull: false },
    hash_verification: { type: DataTypes.STRING(255) },
  }, {
    tableName: 'document_request',
    timestamps: false,
  });

  return DocumentRequest;
};
