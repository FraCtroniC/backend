/** Modelo Sequelize de docentes (Mapeado a tm_teach). */
module.exports = (sequelize, DataTypes) => {
  const Teacher = sequelize.define('Teacher', {
    id_teacher: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'teach_id',
    },
    id_user: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'users_id',
      references: {
        model: 'tm_users',
        key: 'users_id'
      }
    },
    academic_grade: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'teach_gr',
    },
    id_academic_title: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'title_id',
      references: {
        model: 'tm_title',
        key: 'title_id'
      }
    },
    profession: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'teach_pr',
    },
  }, {
    tableName: 'tm_teach',
    timestamps: false,
  });

  return Teacher;
};