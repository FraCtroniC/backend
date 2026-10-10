module.exports = (sequelize, DataTypes) => {
  const AcademicTitle = sequelize.define('AcademicTitle', {
    id_academic_title: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name_title: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
  }, {
    tableName: 'academic_title',
    timestamps: false,
  });

  return AcademicTitle;
};
