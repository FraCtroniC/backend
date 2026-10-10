/** Modelo Sequelize de inscripciones (Mapeado a tt_regis). */
module.exports = (sequelize, DataTypes) => {
  const Registration = sequelize.define('Registration', {
    id_registration: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true,
      field: 'regis_id',
    },
    id_student: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      field: 'stude_id',
      references: {
        model: 'tm_stude',
        key: 'stude_id'
      }
    },
    id_period: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      field: 'perio_id',
      references: {
        model: 'tm_perio',
        key: 'perio_id'
      }
    },
    registration_date: { 
      type: DataTypes.DATE, 
      defaultValue: DataTypes.NOW,
      field: 'regis_dt',
    },
    status: { 
      type: DataTypes.ENUM('Inscrito', 'Retirado'), 
      allowNull: false,
      defaultValue: 'Inscrito',
      field: 'regis_st',
    },
  }, {
    tableName: 'tt_regis',
    timestamps: false,
  });

  return Registration;
};