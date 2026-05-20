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
      type: DataTypes.ENUM('Constancia de Estudio', 'Notas Certificadas', 'Horario', 'Record Académico'), 
      allowNull: false 
    },
    request_date: { 
      type: DataTypes.DATE, 
      defaultValue: DataTypes.NOW 
    },
    status: { 
      type: DataTypes.ENUM('Pendiente', 'Generado', 'Rechazado'), 
      allowNull: false,
      defaultValue: 'Pendiente'
    },
    hash_verification: { 
      type: DataTypes.STRING(255),
      unique: true // El hash debe ser único para cada documento
    },
  }, {
    tableName: 'document_request',
    timestamps: false,
  });

  return DocumentRequest;
};
