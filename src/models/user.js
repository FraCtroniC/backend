/** Modelo Sequelize de usuarios actualizado para la UPTNTMS (Mapeado a tm_users). */
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id_user: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      field: 'users_id',
    },
    id_role: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'roles_id',
    },
    document_id: {
      type: DataTypes.STRING(25),
      allowNull: false, // OBLIGATORIO: La cédula es indispensable.
      unique: true,     // Evita que se repitan números de identificación.
      field: 'users_di',
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true,
      field: 'users_un',
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'users_pw',
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      field: 'users_em',
      validate: {
        isEmail: true,
      }
    },
    phone: {
      type: DataTypes.STRING(25),
      allowNull: true,
      field: 'users_ph',
    },
    date_birth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'users_db',
    },
    first_name: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'users_fnm',
    },
    second_name: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'users_snm',
    },
    first_lastname: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'users_fln',
    },
    second_lastname: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'users_sln',
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'users_ca',
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'users_ua',
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'users_ll',
    },
    status: {
      type: DataTypes.ENUM('Activo', 'Inactivo', 'Bloqueado'),
      allowNull: true,
      field: 'users_st',
    },
    permissions: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'users_pm',
    },
  }, {
    tableName: 'tm_users',
    timestamps: false,
  });

  return User;
};