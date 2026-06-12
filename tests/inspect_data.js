const { sequelize, Section, Career, Subject, Teacher, User } = require('../src/models');

async function run() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    // Get all careers
    const careers = await Career.findAll();
    console.log('Careers in DB:', careers.map(c => ({ id: c.id_career, code: c.code_career, name: c.name_career })));

    // Get all subjects
    const subjects = await Subject.findAll();
    console.log('Subjects in DB count:', subjects.length);

    // Get all sections
    const queryInterface = sequelize.getQueryInterface();
    const tableDesc = await queryInterface.describeTable('section');
    console.log('Section table columns:', Object.keys(tableDesc));

    const sections = await sequelize.query('SELECT * FROM section', { type: sequelize.QueryTypes.SELECT });
    console.log('Sections in DB count:', sections.length);
    if (sections.length > 0) {
      console.log('Sample section:', sections[0]);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await sequelize.close();
  }
}

run();
