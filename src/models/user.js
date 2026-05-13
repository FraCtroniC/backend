/** Modelo Sequelize de usuarios. */
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id_user: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    id_role: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    document_id: {
      type: DataTypes.STRING(25),
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: DataTypes.STRING,
    lastname: DataTypes.STRING,
    email: DataTypes.STRING,
    status: DataTypes.ENUM('Activo', 'Inactivo', 'Bloqueado'),
  }, {
    tableName: 'user_account',
    timestamps: false,
  });

  return User;
};
