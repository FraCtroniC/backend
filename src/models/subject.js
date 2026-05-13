/** Modelo Sequelize de materias. */
module.exports = (sequelize, DataTypes) => {
  const Subject = sequelize.define('Subject', {
    id_subject: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    code_subject: { type: DataTypes.STRING(20), allowNull: false, unique: true },
    name_subject: { type: DataTypes.STRING(100), allowNull: false },
    credit_units: { type: DataTypes.INTEGER, allowNull: false },
  }, {
    tableName: 'subject',
    timestamps: false,
  });

  return Subject;
};
