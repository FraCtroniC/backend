/** Modelo Sequelize de solicitudes de documentos (Mapeado a tt_doreq). */
module.exports = (sequelize, DataTypes) => {
  const DocumentRequest = sequelize.define('DocumentRequest', {
    id_request: { 
      type: DataTypes.UUID, 
      primaryKey: true, 
      defaultValue: DataTypes.UUIDV4,
      field: 'doreq_id',
    },
    id_student: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      field: 'stude_id',
      references: {
        model: 'tm_stude',
        key: 'stude_id'
      }
    },
    document_type: { 
      type: DataTypes.STRING(50), 
      allowNull: false,
      field: 'doreq_tp',
    },
    request_date: { 
      type: DataTypes.DATE, 
      defaultValue: DataTypes.NOW,
      field: 'doreq_is',
    },
    status: { 
      type: DataTypes.ENUM('Emitido', 'Anulado'), 
      allowNull: true,
      defaultValue: 'Emitido',
      field: 'doreq_st',
    },
    hash_verification: { 
      type: DataTypes.STRING(255), 
      allowNull: true,
      field: 'doreq_hv',
    },
  }, {
    tableName: 'tt_doreq',
    timestamps: false,
  });

  return DocumentRequest;
};
