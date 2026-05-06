module.exports = (sequelize, DataTypes) => {
  const Section = sequelize.define('Section', {
    id_section: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_period: { type: DataTypes.INTEGER, allowNull: false },
    id_subject: { type: DataTypes.INTEGER, allowNull: false },
    id_teacher: { type: DataTypes.INTEGER, allowNull: false },
    section_code: { type: DataTypes.STRING(10), allowNull: false },
    quota_max: { type: DataTypes.INTEGER, allowNull: false },
    classroom: { type: DataTypes.STRING(50) },
    schedule_info: { type: DataTypes.STRING(100) },
  }, {
    tableName: 'section',
    timestamps: false,
  });

  return Section;
};
