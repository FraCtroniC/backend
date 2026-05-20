/** Modelo Sequelize de secciones. */
module.exports = (sequelize, DataTypes) => {
  const Section = sequelize.define('Section', {
    id_section: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_period: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'academic_period', // Asegúrate que coincida con el nombre de tu tabla de periodos
        key: 'id_period'
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
    id_teacher: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'teacher',
        key: 'id_teacher'
      }
    },
    section_code: {
      type: DataTypes.STRING(10),
      allowNull: false
      // Podrías añadir un index o unique compuesto con id_period e id_subject
    },
    quota_max: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1 // No tiene sentido una sección con 0 cupos
      }
    },
    classroom: {
      type: DataTypes.STRING(50),
      allowNull: true // Puede ser nulo si es una sección virtual o aún no asignada
    },
    schedule_info: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
  }, {
    tableName: 'section',
    timestamps: false,
  });

  return Section;
};