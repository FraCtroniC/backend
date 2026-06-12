const { sequelize, User, Role, Student, Career, Teacher } = require('../src/models');

async function run() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    const user = await User.findOne({
      where: { username: 'ana.estudiante' },
      attributes: [
        'id_user',
        'email',
        'phone',
        'first_name',
        'second_name',
        'first_lastname',
        'second_lastname',
        'id_role',
        'document_id',
        'date_birth',
      ],
      include: [
        {
          model: Role,
          attributes: ['id_role', 'name_role'],
        },
        {
          model: Student,
          include: [Career],
        },
        {
          model: Teacher,
        },
      ],
    });

    if (!user) {
      console.log('User not found');
      return;
    }

    const data = user.get({ plain: true });
    console.log('Query result plain data:');
    console.log(JSON.stringify(data, null, 2));

    console.log('career:', data.Student?.Career?.name_career ?? 'NOT FOUND');

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await sequelize.close();
  }
}

run();
