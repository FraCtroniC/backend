/** Modelo Sequelize de solicitudes de documentos. */
module.exports = (sequelize, DataTypes) => {
  const DocumentRequest = sequelize.define('DocumentRequest', {
    id_request: { 
      type: DataTypes.UUID, 
      primaryKey: true, 
      defaultValue: DataTypes.UUIDV4 
    },
    id_student: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      references: {
        model: 'student',
        key: 'id_student'
      }
    },
    document_type: { 
      type: DataTypes.STRING(50),
      allowNull: false 
    },
    request_date: { 
      type: DataTypes.DATE, 
      defaultValue: DataTypes.NOW 
    },
    status: { 
      type: DataTypes.ENUM('Emitido', 'Anulado'),
      allowNull: true,
      defaultValue: 'Emitido'
    },
    hash_verification: { 
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  }, {
    tableName: 'document_request',
    timestamps: false,
  });

  return DocumentRequest;
};
