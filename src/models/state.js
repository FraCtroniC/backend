/** Modelo Sequelize de estados (Mapeado a tm_state). */
module.exports = (sequelize, DataTypes) => {
  const State = sequelize.define('State', {
    id_state: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'state_id',
    },
    name_state: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: 'state_nm',
    },
  }, {
    tableName: 'tm_state',
    timestamps: false,
  });

  return State;
};