const { sequelize, Role } = require('../src/models');

async function run() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    const roles = await Role.findAll();
    console.log('Roles in DB:');
    roles.forEach(r => {
      console.log(`Role ID: ${r.id_role}, Name: ${r.name_role}, Desc: ${r.description}`);
    });

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await sequelize.close();
  }
}

run();
