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
const Semester = require('./semester')(sequelize, Sequelize.DataTypes);
const State = require('./state')(sequelize, Sequelize.DataTypes);
const Municipality = require('./municipality')(sequelize, Sequelize.DataTypes);
const Parish = require('./parish')(sequelize, Sequelize.DataTypes);
const PreRegistration = require('./pre_registration')(sequelize, Sequelize.DataTypes);
const PreDocument = require('./pre_document')(sequelize, Sequelize.DataTypes);

// Associations (basic examples)
Role.hasMany(User, { foreignKey: 'id_role' });
User.belongsTo(Role, { foreignKey: 'id_role' });

Career.hasMany(Pensum, { foreignKey: 'id_career' });
Pensum.belongsTo(Career, { foreignKey: 'id_career' });

Pensum.hasMany(PensumSubject, { foreignKey: 'id_pensum' });
PensumSubject.belongsTo(Pensum, { foreignKey: 'id_pensum' });

Subject.hasMany(PensumSubject, { foreignKey: 'id_subject' });
PensumSubject.belongsTo(Subject, { foreignKey: 'id_subject' });

Semester.hasMany(PensumSubject, { foreignKey: 'id_semester' });
PensumSubject.belongsTo(Semester, { foreignKey: 'id_semester' });

PensumSubject.hasMany(SubjectPrerequisite, { foreignKey: 'id_pensum_subject', as: 'Prerequisites' });
SubjectPrerequisite.belongsTo(PensumSubject, { foreignKey: 'id_pensum_subject', as: 'PensumSubject' });

PensumSubject.hasMany(SubjectPrerequisite, { foreignKey: 'id_required_pensum_subject', as: 'RequiredPrerequisites' });
SubjectPrerequisite.belongsTo(PensumSubject, { foreignKey: 'id_required_pensum_subject', as: 'RequiredPensumSubject' });

Subject.hasMany(Section, { foreignKey: 'id_subject' });
Section.belongsTo(Subject, { foreignKey: 'id_subject' });

Teacher.hasMany(Section, { foreignKey: 'id_teacher' });
Section.belongsTo(Teacher, { foreignKey: 'id_teacher' });

AcademicPeriod.hasMany(Section, { foreignKey: 'id_period' });
Section.belongsTo(AcademicPeriod, { foreignKey: 'id_period' });

Career.hasMany(Section, { foreignKey: 'id_career' });
Section.belongsTo(Career, { foreignKey: 'id_career' });

Student.belongsTo(User, { foreignKey: 'id_user' });
User.hasOne(Student, { foreignKey: 'id_user' });

Teacher.belongsTo(User, { foreignKey: 'id_user' });
User.hasOne(Teacher, { foreignKey: 'id_user' });

Career.hasMany(Student, { foreignKey: 'id_career' });
Student.belongsTo(Career, { foreignKey: 'id_career' });

Semester.hasMany(Student, { foreignKey: 'id_semester' });
Student.belongsTo(Semester, { foreignKey: 'id_semester' });

Student.hasMany(Registration, { foreignKey: 'id_student' });
Registration.belongsTo(Student, { foreignKey: 'id_student' });

Registration.hasMany(RegistrationDetail, { foreignKey: 'id_registration' });
RegistrationDetail.belongsTo(Registration, { foreignKey: 'id_registration' });

Section.hasMany(RegistrationDetail, { foreignKey: 'id_section' });
RegistrationDetail.belongsTo(Section, { foreignKey: 'id_section' });

State.hasMany(Municipality, { foreignKey: 'id_state' });
Municipality.belongsTo(State, { foreignKey: 'id_state' });

Municipality.hasMany(Parish, { foreignKey: 'id_municipality' });
Parish.belongsTo(Municipality, { foreignKey: 'id_municipality' });

PreRegistration.belongsTo(State, { foreignKey: 'id_state' });
PreRegistration.belongsTo(Municipality, { foreignKey: 'id_municipality' });
PreRegistration.belongsTo(Parish, { foreignKey: 'id_parish' });
PreRegistration.belongsTo(Career, { foreignKey: 'id_career' });
PreRegistration.belongsTo(Semester, { foreignKey: 'id_semester' });

State.hasMany(PreRegistration, { foreignKey: 'id_state' });
Municipality.hasMany(PreRegistration, { foreignKey: 'id_municipality' });
Parish.hasMany(PreRegistration, { foreignKey: 'id_parish' });
Career.hasMany(PreRegistration, { foreignKey: 'id_career' });
Semester.hasMany(PreRegistration, { foreignKey: 'id_semester' });

PreRegistration.hasMany(PreDocument, { foreignKey: 'id_pre' });
PreDocument.belongsTo(PreRegistration, { foreignKey: 'id_pre' });

AuditLog.belongsTo(User, { foreignKey: 'id_user' });
User.hasMany(AuditLog, { foreignKey: 'id_user' });

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
  Semester,
  State,
  Municipality,
  Parish,
  PreRegistration,
  PreDocument,
};
