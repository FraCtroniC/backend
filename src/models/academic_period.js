/** Modelo Sequelize de periodos academicos. */
module.exports = (sequelize, DataTypes) => {
  const AcademicPeriod = sequelize.define('AcademicPeriod', {
    id_period: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name_period: { type: DataTypes.STRING, allowNull: false, unique: true },
    start_date: { type: DataTypes.DATEONLY, allowNull: false },
    end_date: { type: DataTypes.DATEONLY, allowNull: false },
    enrollment_status: { type: DataTypes.ENUM('Cerrada','Abierta','Modificaciones'), allowNull: false },
    period_status: { type: DataTypes.ENUM('Planificacion','Activo','Culminado'), allowNull: false },
  }, {
    tableName: 'academic_period',
    timestamps: false,
  });

  return AcademicPeriod;
};
