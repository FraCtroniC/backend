const { AcademicPeriod, Section, Registration } = require('../models');

async function checkPeriodLocked(id_period) {
  const period = await AcademicPeriod.findByPk(id_period);
  if (!period) return { locked: true, message: 'Período académico no encontrado' };
  if (period.period_status === 'Culminado') {
    return {
      locked: true,
      message: `No se puede modificar. El período "${period.name_period}" está culminado.`
    };
  }
  return { locked: false };
}

async function checkSectionPeriodLocked(id_section) {
  const section = await Section.findByPk(id_section, { attributes: ['id_period'] });
  if (!section) return { locked: true, message: 'Sección no encontrada' };
  return checkPeriodLocked(section.id_period);
}

async function checkRegistrationPeriodLocked(id_registration) {
  const registration = await Registration.findByPk(id_registration, { attributes: ['id_period'] });
  if (!registration) return { locked: true, message: 'Inscripción no encontrada' };
  return checkPeriodLocked(registration.id_period);
}

async function checkDetailPeriodLocked(id_detail) {
  const { RegistrationDetail } = require('../models');
  const detail = await RegistrationDetail.findByPk(id_detail, {
    attributes: [],
    include: [
      { model: Registration, attributes: ['id_period'] },
      { model: Section, attributes: ['id_period'] }
    ]
  });
  if (!detail) return { locked: true, message: 'Detalle de inscripción no encontrado' };
  const periodId = detail.Registration?.id_period || detail.Section?.id_period;
  if (!periodId) return { locked: true, message: 'No se pudo determinar el período' };
  return checkPeriodLocked(periodId);
}

module.exports = { checkPeriodLocked, checkSectionPeriodLocked, checkRegistrationPeriodLocked, checkDetailPeriodLocked };
