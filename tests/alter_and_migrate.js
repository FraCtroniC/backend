const { sequelize } = require('../src/models');

async function run() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    const queryInterface = sequelize.getQueryInterface();

    // 1. Add id_career column (allowNull: true first)
    console.log('Adding column id_career to section table...');
    await queryInterface.addColumn('section', 'id_career', {
      type: sequelize.Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'career',
        key: 'id_career'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    });
    console.log('Column id_career added successfully.');

    // 2. Migrate existing data
    console.log('Migrating existing sections data to assign id_career...');
    const sections = await sequelize.query('SELECT id_section, section_code FROM section', { type: sequelize.QueryTypes.SELECT });
    for (const sec of sections) {
      let careerId = 1; // Default to ING-SIS
      if (sec.section_code.startsWith('SIS')) {
        careerId = 1;
      } else if (sec.section_code.startsWith('IND')) {
        careerId = 2;
      } else if (sec.section_code.startsWith('ADM')) {
        careerId = 3;
      } else if (sec.section_code.startsWith('MAT')) {
        careerId = 4;
      }
      
      console.log(`Setting id_career = ${careerId} for section ${sec.section_code} (ID: ${sec.id_section})`);
      await sequelize.query('UPDATE section SET id_career = ? WHERE id_section = ?', {
        replacements: [careerId, sec.id_section],
        type: sequelize.QueryTypes.UPDATE
      });
    }

    // 3. Alter column to be NOT NULL
    console.log('Modifying id_career column to be NOT NULL...');
    await queryInterface.changeColumn('section', 'id_career', {
      type: sequelize.Sequelize.INTEGER,
      allowNull: false,
    });
    console.log('Database migration completed successfully!');

  } catch (err) {
    console.error('Error during migration:', err);
  } finally {
    await sequelize.close();
  }
}

run();
