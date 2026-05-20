/** Modelo Sequelize de docentes. */
module.exports = (sequelize, DataTypes) => {
  const Teacher = sequelize.define('Teacher', {
    id_teacher: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_user: {
      type: DataTypes.UUID,
      allowNull: false,
      // Es buena práctica añadir la referencia explícita si no usas un archivo de asociaciones
      references: {
        model: 'user_account',
        key: 'id_user'
      }
    },
    academic_grade: {
      type: DataTypes.STRING(50), // Subí a 50 por si el título es largo (ej. "Magister Scientiarum")
      allowNull: false
    },
    profession: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
  }, {
    tableName: 'teacher',
    timestamps: false,
  });

  return Teacher;
};