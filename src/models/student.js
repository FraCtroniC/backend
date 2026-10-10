/** Modelo Sequelize de estudiantes (Mapeado a tm_stude). */
module.exports = (sequelize, DataTypes) => {
  const Student = sequelize.define('Student', {
    id_student: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'stude_id',
    },
    id_user: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      field: 'users_id',
      references: {
        model: 'tm_users',
        key: 'users_id'
      }
    },
    id_career: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'caree_id',
      references: {
        model: 'tm_caree',
        key: 'caree_id'
      }
    },
    id_semester: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      field: 'semes_id',
    },
    status: {
      type: DataTypes.ENUM('Regular', 'Retirado', 'Egresado', 'Suspendido'),
      allowNull: false,
      defaultValue: 'Regular',
      field: 'stude_st',
    },
    admission_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'stude_dt',
    },
  }, {
    tableName: 'tm_stude',
    timestamps: false,
  });

  return Student;
};