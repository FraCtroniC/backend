/** Modelo Sequelize de detalles de inscripcion. */
module.exports = (sequelize, DataTypes) => {
  const RegistrationDetail = sequelize.define('RegistrationDetail', {
    id_detail: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    id_registration: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      references: {
        model: 'registration',
        key: 'id_registration'
      }
    },
    id_section: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      references: {
        model: 'section',
        key: 'id_section'
      }
    },
    // Usamos DECIMAL(4, 2) para notas como "18.50" o "20.00"
    corte_1: { type: DataTypes.DECIMAL(4, 2), defaultValue: 0.00 },
    corte_2: { type: DataTypes.DECIMAL(4, 2), defaultValue: 0.00 },
    corte_3: { type: DataTypes.DECIMAL(4, 2), defaultValue: 0.00 },
    corte_4: { type: DataTypes.DECIMAL(4, 2), defaultValue: 0.00 },
    recuperatorio: { type: DataTypes.DECIMAL(4, 2), defaultValue: 0.00 },
    final_note: { type: DataTypes.DECIMAL(4, 2), defaultValue: 0.00 },
    attendance_percentage: { 
      type: DataTypes.INTEGER, 
      defaultValue: 100,
      validate: { min: 0, max: 100 } 
    },
    subject_status: { 
      type: DataTypes.ENUM('Cursando', 'Aprobado', 'Reprobado', 'Retirado'), 
      allowNull: false,
      defaultValue: 'Cursando'
    },
    grade_status: { 
      type: DataTypes.ENUM('Cargando', 'Confirmada'), 
      allowNull: false,
      defaultValue: 'Cargando'
    },
  }, {
    tableName: 'registration_detail',
    timestamps: false,
  });

  return RegistrationDetail;
};