const { sequelize, User, Role, Student } = require('../src/models');

async function run() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    const users = await User.findAll({
      include: [{ model: Role }, { model: Student }]
    });

    console.log('Users in DB:');
    users.forEach(u => {
      console.log(`User: ${u.username}, Role: ${u.Role?.name_role}, Name: ${u.first_name} ${u.first_lastname}, HasStudent: ${!!u.Student}, StudentId: ${u.Student?.id_student}`);
    });

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await sequelize.close();
  }
}

run();
