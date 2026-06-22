const { User, Student, Registration, RegistrationDetail, Section, Subject, AcademicPeriod, Career } = require('../models');
const { Op } = require('sequelize');

exports.getHistory = async (req, res, next) => {
  try {
    const { documentId } = req.params;

    // Find the user by documentId (cedula/id)
    const user = await User.findOne({
      where: { document_id: documentId },
      include: [
        {
          model: Student,
          include: [Career]
        }
      ]
    });

    if (!user || !user.Student) {
      return res.status(404).json({ message: 'Estudiante no encontrado.' });
    }

    const studentId = user.Student.id_student;

    // Fetch all registrations and details for this student
    const registrations = await Registration.findAll({
      where: { id_student: studentId },
      include: [
        {
          model: RegistrationDetail,
          include: [
            {
              model: Section,
              include: [Subject, AcademicPeriod]
            }
          ]
        }
      ],
      order: [
        // Sort by period name if possible, or registration_date
        ['registration_date', 'ASC']
      ]
    });

    // Calculate metrics and build timeline
    let totalScore = 0;
    let gradedCoursesCount = 0;
    let totalCredits = 0;
    let totalCoursesTaken = 0;
    const timeline = [];

    registrations.forEach(registration => {
      if (registration.RegistrationDetails && registration.RegistrationDetails.length > 0) {
        registration.RegistrationDetails.forEach(detail => {
          totalCoursesTaken++;
          
          const section = detail.Section;
          const subject = section ? section.Subject : null;
          const period = section ? section.AcademicPeriod : null;
          
          const grade = parseFloat(detail.final_note || 0);
          const credits = subject ? parseInt(subject.credit_units || 0, 10) : 0;
          
          // Timeline entry
          let statusLabel = detail.subject_status || 'Cursando';
          if (statusLabel === 'Aprobado') {
             totalCredits += credits;
          }

          if (statusLabel === 'Aprobado' || statusLabel === 'Reprobado') {
             totalScore += grade;
             gradedCoursesCount++;
          }

          timeline.push({
            period: period ? period.name_period : 'Desconocido',
            subject: subject ? subject.name_subject : 'Materia Desconocida',
            grade: grade,
            status: statusLabel
          });
        });
      }
    });

    const cum = gradedCoursesCount > 0 ? (totalScore / gradedCoursesCount).toFixed(1) : 0;

    res.json({
      id: user.document_id,
      name: `${user.first_name} ${user.first_lastname}`.trim(),
      career: user.Student.Career ? user.Student.Career.name_career : 'Sin asignar',
      cum: Number(cum),
      credits: totalCredits,
      courses: totalCoursesTaken,
      timeline: timeline.sort((a, b) => b.period.localeCompare(a.period)) // Sort latest periods first roughly
    });

  } catch (err) {
    console.error('Error fetching academic history:', err);
    next(err);
  }
};
