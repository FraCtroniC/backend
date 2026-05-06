module.exports = (sequelize, DataTypes) => {
  const SubjectPrerequisite = sequelize.define('SubjectPrerequisite', {
    id_prerequisite: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_pensum_subject: { type: DataTypes.INTEGER, allowNull: false },
    id_required_pensum_subject: { type: DataTypes.INTEGER, allowNull: false },
  }, {
    tableName: 'subject_prerequisite',
    timestamps: false,
  });

  return SubjectPrerequisite;
};
