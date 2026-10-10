/** Modelo Sequelize de títulos académicos (Mapeado a tm_title). */
module.exports = (sequelize, DataTypes) => {
  const AcademicTitle = sequelize.define('AcademicTitle', {
    id_academic_title: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'title_id',
    },
    name_title: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: 'title_nm',
    },
  }, {
    tableName: 'tm_title',
    timestamps: false,
  });

  return AcademicTitle;
};
