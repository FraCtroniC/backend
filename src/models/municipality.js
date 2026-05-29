module.exports = (sequelize, DataTypes) => {
  const Municipality = sequelize.define('Municipality', {
    id_municipality: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_state: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'states',
        key: 'id_state',
      },
    },
    name_municipality: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  }, {
    tableName: 'municipalities',
    timestamps: false,
  });

  return Municipality;
};