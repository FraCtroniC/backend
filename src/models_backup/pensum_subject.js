/** Modelo Sequelize de materias por pensum. */
module.exports = (sequelize, DataTypes) => {
  const PensumSubject = sequelize.define('PensumSubject', {
    id_pensum_subject: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    id_pensum: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      references: {
        model: 'pensum',
        key: 'id_pensum'
      }
    },
    id_subject: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      references: {
        model: 'subject',
        key: 'id_subject'
      }
    },
    id_semester: {
      type: DataTypes.INTEGER, 
      allowNull: false,
      references: {
        model: 'semester',
        key: 'id_semester'
      }
    },
    code_subject: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
  }, {
    tableName: 'pensum_subject',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['id_pensum', 'code_subject']
      }
    ]
  });

  return PensumSubject;
};
