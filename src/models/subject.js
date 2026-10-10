/** Modelo Sequelize de materias (Mapeado a tm_subje). */
module.exports = (sequelize, DataTypes) => {
  const Subject = sequelize.define('Subject', {
    id_subject: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'subje_id',
    },
    code_subject: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'subje_cd',
    },
    name_subject: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'subje_nm',
    },
    credit_units: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'subje_uc',
    },
  }, {
    tableName: 'tm_subje',
    timestamps: false,
  });

  return Subject;
};