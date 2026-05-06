const express = require('express');
const router = express.Router();

const health = require('../controllers/healthController');
const userRoutes = require('./userRoutes');
const careerRoutes = require('./careerRoutes');
const subjectRoutes = require('./subjectRoutes');
const sectionRoutes = require('./sectionRoutes');
const studentRoutes = require('./studentRoutes');
const teacherRoutes = require('./teacherRoutes');
const registrationRoutes = require('./registrationRoutes');
const registrationDetailRoutes = require('./registrationDetailRoutes');
const pensumRoutes = require('./pensumRoutes');
const pensumSubjectRoutes = require('./pensumSubjectRoutes');
const subjectPrerequisiteRoutes = require('./subjectPrerequisiteRoutes');
const roleRoutes = require('./roleRoutes');
const academicPeriodRoutes = require('./academicPeriodRoutes');
const auditLogRoutes = require('./auditLogRoutes');
const documentRequestRoutes = require('./documentRequestRoutes');

router.get('/', health.ping);
router.use('/users', userRoutes);
router.use('/careers', careerRoutes);
router.use('/subjects', subjectRoutes);
router.use('/sections', sectionRoutes);
router.use('/students', studentRoutes);
router.use('/teachers', teacherRoutes);
router.use('/registrations', registrationRoutes);
router.use('/registration-details', registrationDetailRoutes);
router.use('/pensums', pensumRoutes);
router.use('/pensum-subjects', pensumSubjectRoutes);
router.use('/prerequisites', subjectPrerequisiteRoutes);
router.use('/roles', roleRoutes);
router.use('/periods', academicPeriodRoutes);
router.use('/audit-logs', auditLogRoutes);
router.use('/document-requests', documentRequestRoutes);

module.exports = router;
