/** Modelo Sequelize de roles (Mapeado a tm_roles). */
module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    id_role: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'roles_id',
    },
    name_role: {
      type: DataTypes.ENUM('Admin', 'Docente', 'Estudiante', 'Control de Estudios', 'Gestión Académica'),
      allowNull: false,
      unique: true,
      field: 'roles_nm',
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'roles_dc',
    },
  }, {
    tableName: 'tm_roles',
    timestamps: false,
  });

  return Role;
};