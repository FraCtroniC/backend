/** Modelo Sequelize de materias por pensum. */
module.exports = (sequelize, DataTypes) => {
  const PensumSubject = sequelize.define('PensumSubject', {
    id_pensum_subject: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_pensum: { type: DataTypes.INTEGER, allowNull: false },
    id_subject: { type: DataTypes.INTEGER, allowNull: false },
    semester: { type: DataTypes.INTEGER, allowNull: false },
  }, {
    tableName: 'pensum_subject',
    timestamps: false,
  });

  return PensumSubject;
};
