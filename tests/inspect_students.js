const { sequelize, Student, Career, User } = require('../src/models');

async function run() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    const students = await Student.findAll({
      include: [
        { model: User },
        { model: Career }
      ]
    });

    console.log('Students in DB:');
    students.forEach(s => {
      console.log(`Student ID: ${s.id_student}, User: ${s.User?.username}, Career Name: ${s.Career?.name_career}, Career ID: ${s.id_career}`);
    });

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await sequelize.close();
  }
}

run();
