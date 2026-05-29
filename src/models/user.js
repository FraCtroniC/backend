/** Modelo Sequelize de usuarios actualizado para la UPTNTMS. */
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
      allowNull: false, // OBLIGATORIO: La cédula es indispensable.
      unique: true,     // Evita que se repitan números de identificación.
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
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isEmail: true,
      }
    },
    phone: {
      type: DataTypes.STRING(25),
      allowNull: true,
    },
    date_birth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'date_birth'
    },
    first_name: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    second_name: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    first_lastname: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    second_lastname: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('Activo', 'Inactivo', 'Bloqueado'),
      allowNull: true,
    },
  }, {
    tableName: 'user_account',
    timestamps: false,
  });

  return User;
};