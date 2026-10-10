/** Modelo Sequelize de documentos de preinscripcion (Mapeado a tt_predo). */
module.exports = (sequelize, DataTypes) => {
  const PreDocument = sequelize.define('PreDocument', {
    id_doc: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'predo_id',
    },
    id_pre: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'prere_id',
      references: {
        model: 'tt_prere',
        key: 'prere_id',
      },
    },
    document_type: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'predo_ty',
    },
    file_path: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'predo_fph',
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
      field: 'predo_ivf',
    },
    upload_date: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'predo_udt',
    },
  }, {
    tableName: 'tt_predo',
    timestamps: false,
  });

  return PreDocument;
};