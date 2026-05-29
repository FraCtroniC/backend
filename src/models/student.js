/** Modelo Sequelize de estudiantes. */
module.exports = (sequelize, DataTypes) => {
  const Student = sequelize.define('Student', {
    id_student: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_user: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true, // UN estudiante solo puede tener UNA cuenta de usuario vinculada
      references: {
        model: 'user_account',
        key: 'id_user'
      }
    },
    id_career: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'career', // Ajusta si el nombre de tu tabla de carreras es distinto
        key: 'id_career'
      }
    },
    id_semester: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    status: {
      type: DataTypes.ENUM('Regular', 'Retirado', 'Egresado', 'Suspendido'),
      allowNull: false,
      defaultValue: 'Regular'
    },
    admission_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW // Si no se manda, toma la fecha actual
    },
  }, {
    tableName: 'student',
    timestamps: false,
  });

  return Student;
};