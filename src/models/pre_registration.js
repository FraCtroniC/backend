/** Modelo Sequelize de preinscripciones (Mapeado a tt_prere). */
module.exports = (sequelize, DataTypes) => {
  const PreRegistration = sequelize.define('PreRegistration', {
    id_pre: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'prere_id',
    },
    first_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'prere_fnm',
    },
    second_name: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'prere_snm',
    },
    first_lastname: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'prere_fln',
    },
    second_lastname: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'prere_sln',
    },
    nationality: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'prere_nat',
    },
    document_type: {
      type: DataTypes.CHAR(1),
      allowNull: false,
      field: 'prere_dty',
    },
    document_id: {
      type: DataTypes.STRING(25),
      allowNull: false,
      unique: true,
      field: 'prere_di',
    },
    birth_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'prere_bdt',
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: { isEmail: true },
      field: 'prere_em',
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'prere_ph',
    },
    id_state: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'state_id',
    },
    id_municipality: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'munst_id',
    },
    id_parish: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'parrq_id',
    },
    full_address: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'prere_fad',
    },
    entry_mode: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'prere_emd',
    },
    academic_area: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'prere_aar',
    },
    id_career: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'caree_id',
    },
    id_semester: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
      field: 'semes_id',
    },
    inst_procedencia: {
      type: DataTypes.STRING(150),
      allowNull: true,
      field: 'prere_ipr',
    },
    inst_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'prere_ity',
    },
    grad_year: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'prere_gyr',
    },
    observations: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'prere_obs',
    },
    status_pre: {
      type: DataTypes.ENUM('Pendiente', 'En Revisión', 'Aprobado', 'Rechazado'),
      allowNull: true,
      defaultValue: 'Pendiente',
      field: 'prere_st',
    },
    confirmo_info: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
      field: 'prere_cin',
    },
    autorizo_datos: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
      field: 'prere_ada',
    },
    verification_code: {
      type: DataTypes.STRING(12),
      allowNull: true,
      unique: true,
      field: 'prere_vco',
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'prere_ca',
    },
  }, {
    tableName: 'tt_prere',
    timestamps: false,
  });

  return PreRegistration;
};