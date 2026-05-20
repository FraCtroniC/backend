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
    semester: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      validate: {
        min: 1,
        max: 12 // Límite lógico de semestres
      }
    },
  }, {
    tableName: 'pensum_subject',
    timestamps: false,
    // Índice único para evitar que la misma materia esté duplicada en el mismo pensum
    indexes: [
      {
        unique: true,
        fields: ['id_pensum', 'id_subject']
      }
    ]
  });

  return PensumSubject;
};
