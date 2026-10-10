/** Modelo Sequelize de semestres (Mapeado a tm_semes). */
module.exports = (sequelize, DataTypes) => {
  const Semester = sequelize.define('Semester', {
    id_semester: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'semes_id',
    },
    name_semester: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
      field: 'semes_nm',
    },
    number_semester: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      field: 'semes_nr',
    },
  }, {
    tableName: 'tm_semes',
    timestamps: false,
  });

  return Semester;
};