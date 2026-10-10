/** Modelo Sequelize de municipios (Mapeado a tm_munst). */
module.exports = (sequelize, DataTypes) => {
  const Municipality = sequelize.define('Municipality', {
    id_municipality: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'munst_id',
    },
    id_state: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'state_id',
      references: {
        model: 'tm_state',
        key: 'state_id',
      },
    },
    name_municipality: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'munst_nm',
    },
  }, {
    tableName: 'tm_munst',
    timestamps: false,
  });

  return Municipality;
};