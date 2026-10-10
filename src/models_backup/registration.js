/** Modelo Sequelize de inscripciones. */
module.exports = (sequelize, DataTypes) => {
  const Registration = sequelize.define('Registration', {
    id_registration: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    id_student: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      references: {
        model: 'student', // Se conecta con la tabla de estudiantes
        key: 'id_student'
      }
    },
    id_period: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      references: {
        model: 'academic_period', // Se conecta con el periodo (ej. 2026-I)
        key: 'id_period'
      }
    },
    registration_date: { 
      type: DataTypes.DATE, 
      defaultValue: DataTypes.NOW 
    },
    status: { 
      type: DataTypes.ENUM('Inscrito', 'Retirado'), 
      allowNull: false,
      defaultValue: 'Inscrito' // Por defecto, si se crea el registro, está inscrito
    },
  }, {
    tableName: 'registration',
    timestamps: false,
  });

  return Registration;
};