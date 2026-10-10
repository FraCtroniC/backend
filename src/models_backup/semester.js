module.exports = (sequelize, DataTypes) => {
  const Semester = sequelize.define('Semester', {
    id_semester: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name_semester: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
    },
    number_semester: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
  }, {
    tableName: 'semester',
    timestamps: false,
  });

  return Semester;
};