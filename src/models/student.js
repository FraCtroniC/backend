module.exports = (sequelize, DataTypes) => {
  const Student = sequelize.define('Student', {
    id_student: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_user: { type: DataTypes.UUID, allowNull: false },
    id_career: { type: DataTypes.INTEGER, allowNull: false },
    current_semester: { type: DataTypes.INTEGER, defaultValue: 1 },
    status: { type: DataTypes.ENUM('Regular','Retirado','Egresado','Suspendido'), allowNull: false },
    admission_date: { type: DataTypes.DATEONLY, allowNull: false },
  }, {
    tableName: 'student',
    timestamps: false,
  });

  return Student;
};
