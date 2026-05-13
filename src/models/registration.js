/** Modelo Sequelize de inscripciones. */
module.exports = (sequelize, DataTypes) => {
  const Registration = sequelize.define('Registration', {
    id_registration: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_student: { type: DataTypes.INTEGER, allowNull: false },
    id_period: { type: DataTypes.INTEGER, allowNull: false },
    registration_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    status: { type: DataTypes.ENUM('Inscrito','Retirado'), allowNull: false },
  }, {
    tableName: 'registration',
    timestamps: false,
  });

  return Registration;
};
