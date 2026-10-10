/** Modelo Sequelize de parroquias (Mapeado a tm_parrq). */
module.exports = (sequelize, DataTypes) => {
  const Parish = sequelize.define('Parish', {
    id_parish: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'parrq_id',
    },
    id_municipality: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'munst_id',
      references: {
        model: 'tm_munst',
        key: 'munst_id',
      },
    },
    name_parish: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'parrq_nm',
    },
  }, {
    tableName: 'tm_parrq',
    timestamps: false,
  });

  return Parish;
};