module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    id_role: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name_role: { type: DataTypes.ENUM('Admin','Docente','Estudiante'), allowNull: false },
    description: { type: DataTypes.STRING },
  }, {
    tableName: 'role',
    timestamps: false,
  });

  return Role;
};
