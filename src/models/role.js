/** Modelo Sequelize de roles. */
module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    id_role: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name_role: {
      type: DataTypes.ENUM('Admin', 'Docente', 'Estudiante'),
      allowNull: false,
      unique: true // IMPORTANTE: No quieres dos roles que se llamen igual
    },
    description: {
      type: DataTypes.STRING(255), // Un límite estándar para descripciones
      allowNull: true
    },
  }, {
    tableName: 'role',
    timestamps: false,
  });

  return Role;
};