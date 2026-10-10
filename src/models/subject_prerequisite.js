/** Modelo Sequelize de prerrequisitos de materias (Mapeado a tt_subpr). */
module.exports = (sequelize, DataTypes) => {
  const SubjectPrerequisite = sequelize.define('SubjectPrerequisite', {
    id_prerequisite: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'subpr_id',
    },
    // La materia que quieres cursar
    id_pensum_subject: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'pesub_id',
      references: {
        model: 'tt_pesub',
        key: 'pesub_id'
      }
    },
    // La materia que debes haber aprobado antes
    id_required_pensum_subject: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'reqsu_id',
      references: {
        model: 'tt_pesub',
        key: 'pesub_id'
      }
    },
  }, {
    tableName: 'tt_subpr',
    timestamps: false,
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