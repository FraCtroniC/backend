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
      allowNull: false, // OBLIGATORIO: Todo usuario debe tener un rol asignado.
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
    name: {
      type: DataTypes.STRING(100),
      allowNull: false, // OBLIGATORIO.
    },
    lastname: {
      type: DataTypes.STRING(100),
      allowNull: false, // OBLIGATORIO.
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true, // Sequelize valida que sea un correo real.
      }
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true, // OPCIONAL: Puede quedar nulo si el usuario no lo da.
    },
    birth_date: {
      type: DataTypes.DATEONLY, // Solo guarda fecha sin la hora (YYYY-MM-DD).
      allowNull: false, // OBLIGATORIO: Importante para el registro académico.
    },
    status: {
      type: DataTypes.ENUM('Activo', 'Inactivo', 'Bloqueado'),
      defaultValue: 'Activo',
    },
  }, {
    tableName: 'user_account',
    timestamps: false,
  });

  return User;
};