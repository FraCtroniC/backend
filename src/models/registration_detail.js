/** Modelo Sequelize de detalles de inscripcion (Mapeado a tt_redet). */
module.exports = (sequelize, DataTypes) => {
  const RegistrationDetail = sequelize.define('RegistrationDetail', {
    id_detail: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true,
      field: 'redet_id',
    },
    id_registration: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      field: 'regis_id',
      references: {
        model: 'tt_regis',
        key: 'regis_id'
      }
    },
    id_section: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      field: 'secci_id',
      references: {
        model: 'tt_secci',
        key: 'secci_id'
      }
    },
    corte_1: { type: DataTypes.DECIMAL(4, 2), defaultValue: 0.00, field: 'redet_c1' },
    corte_2: { type: DataTypes.DECIMAL(4, 2), defaultValue: 0.00, field: 'redet_c2' },
    corte_3: { type: DataTypes.DECIMAL(4, 2), defaultValue: 0.00, field: 'redet_c3' },
    corte_4: { type: DataTypes.DECIMAL(4, 2), defaultValue: 0.00, field: 'redet_c4' },
    recuperatorio: { type: DataTypes.DECIMAL(4, 2), defaultValue: 0.00, field: 'redet_re' },
    final_note: { type: DataTypes.DECIMAL(4, 2), defaultValue: 0.00, field: 'redet_fn' },
    attendance_percentage: { 
      type: DataTypes.INTEGER, 
      defaultValue: 100,
      field: 'redet_at',
      validate: { min: 0, max: 100 } 
    },
    subject_status: { 
      type: DataTypes.ENUM('Cursando', 'Aprobado', 'Reprobado', 'Retirado'), 
      allowNull: false,
      defaultValue: 'Cursando',
      field: 'redet_ss',
    },
    grade_status: { 
      type: DataTypes.ENUM('Cargando', 'Confirmada'), 
      allowNull: false,
      defaultValue: 'Cargando',
      field: 'redet_gs',
    },
  }, {
    tableName: 'tt_redet',
    timestamps: false,
  });

  return RegistrationDetail;
};