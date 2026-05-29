module.exports = (sequelize, DataTypes) => {
  const PreRegistration = sequelize.define('PreRegistration', {
    id_pre: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    first_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    second_name: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    first_lastname: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    second_lastname: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    nationality: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    document_type: {
      type: DataTypes.CHAR(1),
      allowNull: false,
    },
    document_id: {
      type: DataTypes.STRING(25),
      allowNull: false,
      unique: true,
    },
    birth_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: { isEmail: true },
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    id_state: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_municipality: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_parish: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    full_address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    entry_mode: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    academic_area: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    id_career: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_semester: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
    },
    inst_procedencia: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    inst_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    grad_year: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    observations: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status_pre: {
      type: DataTypes.ENUM('Pendiente', 'En Revisión', 'Aprobado', 'Rechazado'),
      allowNull: true,
      defaultValue: 'Pendiente',
    },
    confirmo_info: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    autorizo_datos: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    verification_code: {
      type: DataTypes.STRING(12),
      allowNull: true,
      unique: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'tt_pre_registration',
    timestamps: false,
  });

  return PreRegistration;
};