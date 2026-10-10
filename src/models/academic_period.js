/** Modelo Sequelize de periodos academicos (Mapeado a tm_perio). */
module.exports = (sequelize, DataTypes) => {
  const AcademicPeriod = sequelize.define('AcademicPeriod', {
    id_period: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true,
      field: 'perio_id',
    },
    name_period: { 
      type: DataTypes.STRING(20), // Ejemplo: "2026-I" o "2026-II"
      allowNull: false, 
      unique: true,
      field: 'perio_nm',
    },
    start_date: { 
      type: DataTypes.DATEONLY, 
      allowNull: false,
      field: 'perio_sd',
    },
    end_date: { 
      type: DataTypes.DATEONLY, 
      allowNull: false,
      field: 'perio_ed',
    },
    enrollment_status: { 
      type: DataTypes.ENUM('Planificacion', 'Activo', 'Culminado', 'Cerrada', 'Abierta', 'Modificaciones'),
      allowNull: false,
      defaultValue: 'Cerrada',
      field: 'perio_es',
    },
    period_status: { 
      type: DataTypes.ENUM('Cerrada', 'Abierta', 'Modificaciones', 'Planificacion', 'Activo', 'Culminado'),
      allowNull: false,
      defaultValue: 'Planificacion',
      field: 'perio_st',
    },
  }, {
    tableName: 'tm_perio',
    timestamps: false,
  });

  return AcademicPeriod;
};
