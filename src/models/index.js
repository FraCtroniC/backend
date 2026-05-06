const { sequelize, Sequelize } = require('../config/database');

const User = require('./user')(sequelize, Sequelize.DataTypes);
const Career = require('./career')(sequelize, Sequelize.DataTypes);
const Role = require('./role')(sequelize, Sequelize.DataTypes);
const Subject = require('./subject')(sequelize, Sequelize.DataTypes);
const Pensum = require('./pensum')(sequelize, Sequelize.DataTypes);
const PensumSubject = require('./pensum_subject')(sequelize, Sequelize.DataTypes);
const SubjectPrerequisite = require('./subject_prerequisite')(sequelize, Sequelize.DataTypes);
const AcademicPeriod = require('./academic_period')(sequelize, Sequelize.DataTypes);
const Section = require('./section')(sequelize, Sequelize.DataTypes);
const Student = require('./student')(sequelize, Sequelize.DataTypes);
const Teacher = require('./teacher')(sequelize, Sequelize.DataTypes);
const Registration = require('./registration')(sequelize, Sequelize.DataTypes);
const RegistrationDetail = require('./registration_detail')(sequelize, Sequelize.DataTypes);
const AuditLog = require('./audit_log')(sequelize, Sequelize.DataTypes);
const DocumentRequest = require('./document_request')(sequelize, Sequelize.DataTypes);

// Associations (basic examples)
Role.hasMany(User, { foreignKey: 'id_role' });
User.belongsTo(Role, { foreignKey: 'id_role' });

Career.hasMany(Pensum, { foreignKey: 'id_career' });
Pensum.belongsTo(Career, { foreignKey: 'id_career' });

Pensum.hasMany(PensumSubject, { foreignKey: 'id_pensum' });
PensumSubject.belongsTo(Pensum, { foreignKey: 'id_pensum' });

Subject.hasMany(PensumSubject, { foreignKey: 'id_subject' });
PensumSubject.belongsTo(Subject, { foreignKey: 'id_subject' });

Subject.hasMany(Section, { foreignKey: 'id_subject' });
Section.belongsTo(Subject, { foreignKey: 'id_subject' });

Teacher.hasMany(Section, { foreignKey: 'id_teacher' });
Section.belongsTo(Teacher, { foreignKey: 'id_teacher' });

AcademicPeriod.hasMany(Section, { foreignKey: 'id_period' });
Section.belongsTo(AcademicPeriod, { foreignKey: 'id_period' });

Student.belongsTo(User, { foreignKey: 'id_user' });
User.hasOne(Student, { foreignKey: 'id_user' });

Student.hasMany(Registration, { foreignKey: 'id_student' });
Registration.belongsTo(Student, { foreignKey: 'id_student' });

Registration.hasMany(RegistrationDetail, { foreignKey: 'id_registration' });
RegistrationDetail.belongsTo(Registration, { foreignKey: 'id_registration' });

Section.hasMany(RegistrationDetail, { foreignKey: 'id_section' });
RegistrationDetail.belongsTo(Section, { foreignKey: 'id_section' });

module.exports = {
  sequelize,
  Sequelize,
  User,
  Career,
  Role,
  Subject,
  Pensum,
  PensumSubject,
  SubjectPrerequisite,
  AcademicPeriod,
  Section,
  Student,
  Teacher,
  Registration,
  RegistrationDetail,
  AuditLog,
  DocumentRequest,
};
