module.exports = (sequelize, DataTypes) => {
  const PreDocument = sequelize.define('PreDocument', {
    id_doc: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_pre: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    document_type: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    file_path: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    upload_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'tt_pre_documents',
    timestamps: false,
  });

  return PreDocument;
};