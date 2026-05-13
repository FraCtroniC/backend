/** Modelo Sequelize de detalles de inscripcion. */
module.exports = (sequelize, DataTypes) => {
  const RegistrationDetail = sequelize.define('RegistrationDetail', {
    id_detail: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_registration: { type: DataTypes.INTEGER, allowNull: false },
    id_section: { type: DataTypes.INTEGER, allowNull: false },
    corte_1: { type: DataTypes.DECIMAL(4,2) },
    corte_2: { type: DataTypes.DECIMAL(4,2) },
    corte_3: { type: DataTypes.DECIMAL(4,2) },
    corte_4: { type: DataTypes.DECIMAL(4,2) },
    recuperatorio: { type: DataTypes.DECIMAL(4,2) },
    final_note: { type: DataTypes.DECIMAL(4,2) },
    attendance_percentage: { type: DataTypes.INTEGER, defaultValue: 100 },
    subject_status: { type: DataTypes.ENUM('Cursando','Aprobado','Reprobado','Retirado'), allowNull: false },
  }, {
    tableName: 'registration_detail',
    timestamps: false,
  });

  return RegistrationDetail;
};
