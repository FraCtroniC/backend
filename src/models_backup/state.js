module.exports = (sequelize, DataTypes) => {
  const State = sequelize.define('State', {
    id_state: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name_state: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
  }, {
    tableName: 'states',
    timestamps: false,
  });

  return State;
};