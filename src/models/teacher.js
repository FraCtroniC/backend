/** Modelo Sequelize de docentes. */
module.exports = (sequelize, DataTypes) => {
  const Teacher = sequelize.define('Teacher', {
    id_teacher: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_user: { type: DataTypes.UUID, allowNull: false },
    academic_grade: { type: DataTypes.STRING(20) },
    profession: { type: DataTypes.STRING(100) },
  }, {
    tableName: 'teacher',
    timestamps: false,
  });

  return Teacher;
};
