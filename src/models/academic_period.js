/** Modelo Sequelize de periodos academicos. */
module.exports = (sequelize, DataTypes) => {
  const AcademicPeriod = sequelize.define('AcademicPeriod', {
    id_period: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    name_period: { 
      type: DataTypes.STRING(20), // Ejemplo: "2026-I" o "2026-II"
      allowNull: false, 
      unique: true 
    },
    start_date: { 
      type: DataTypes.DATEONLY, 
      allowNull: false 
    },
    end_date: { 
      type: DataTypes.DATEONLY, 
      allowNull: false 
    },
    enrollment_status: { 
      type: DataTypes.ENUM('Planificacion', 'Activo', 'Culminado', 'Cerrada', 'Abierta', 'Modificaciones'),
      allowNull: false,
      defaultValue: 'Cerrada'
    },
    period_status: { 
      type: DataTypes.ENUM('Cerrada', 'Abierta', 'Modificaciones', 'Planificacion', 'Activo', 'Culminado'),
      allowNull: false,
      defaultValue: 'Planificacion'
    },
  }, {
    tableName: 'academic_period',
    timestamps: false,
  });

  return AcademicPeriod;
};
