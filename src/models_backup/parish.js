module.exports = (sequelize, DataTypes) => {
  const Parish = sequelize.define('Parish', {
    id_parish: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_municipality: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'municipalities',
        key: 'id_municipality',
      },
    },
    name_parish: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  }, {
    tableName: 'parishes',
    timestamps: false,
  });

  return Parish;
};