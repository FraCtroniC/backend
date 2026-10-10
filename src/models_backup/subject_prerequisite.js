/** Modelo Sequelize de prerrequisitos de materias. */
module.exports = (sequelize, DataTypes) => {
  const SubjectPrerequisite = sequelize.define('SubjectPrerequisite', {
    id_prerequisite: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    // La materia que quieres cursar
    id_pensum_subject: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'pensum_subject', // Asegúrate que este sea el nombre real de tu tabla de pensum
        key: 'id_pensum_subject'
      }
    },
    // La materia que debes haber aprobado antes
    id_required_pensum_subject: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'pensum_subject',
        key: 'id_pensum_subject'
      }
    },
  }, {
    tableName: 'subject_prerequisite',
    timestamps: false,
    // Validación de nivel de tabla para evitar que una materia sea su propio prerrequisito
    validate: {
      noSelfPrerequisite() {
        if (this.id_pensum_subject === this.id_required_pensum_subject) {
          throw new Error('Una materia no puede ser prerrequisito de sí misma.');
        }
      }
    }
  });

  return SubjectPrerequisite;
};