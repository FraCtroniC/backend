const { Classroom, sequelize } = require('./src/models');

async function syncClassrooms() {
  try {
    await Classroom.sync({ alter: true });
    console.log('Classroom table synced successfully');

    const count = await Classroom.count();
    if (count === 0) {
      console.log('Seeding initial classrooms...');
      const seedData = [
        {
          code_classroom: 'AULA-01',
          name_classroom: 'Aula 01',
          building: 'Edificio Central',
          floor: 'Planta Baja',
          capacity: 35,
          classroom_type: 'Teoría',
          status: 'Disponible',
          resources: 'Pizarra acrílica, 35 pupitres, A/C'
        },
        {
          code_classroom: 'AULA-02',
          name_classroom: 'Aula 02',
          building: 'Edificio Central',
          floor: 'Planta Baja',
          capacity: 35,
          classroom_type: 'Teoría',
          status: 'Disponible',
          resources: 'Pizarra acrílica, 35 pupitres, Video beam, A/C'
        },
        {
          code_classroom: 'AULA-03',
          name_classroom: 'Aula 03',
          building: 'Edificio Central',
          floor: 'Planta Baja',
          capacity: 40,
          classroom_type: 'Teoría',
          status: 'Disponible',
          resources: 'Pizarra acrílica, 40 pupitres, A/C'
        },
        {
          code_classroom: 'AULA-04',
          name_classroom: 'Aula 04',
          building: 'Edificio Central',
          floor: 'Piso 1',
          capacity: 30,
          classroom_type: 'Teoría',
          status: 'Disponible',
          resources: 'Pizarra acrílica, 30 pupitres, A/C'
        },
        {
          code_classroom: 'AULA-05',
          name_classroom: 'Aula 05',
          building: 'Edificio Central',
          floor: 'Piso 1',
          capacity: 30,
          classroom_type: 'Teoría',
          status: 'Disponible',
          resources: 'Pizarra acrílica, 30 pupitres, A/C'
        },
        {
          code_classroom: 'AULA-06',
          name_classroom: 'Aula 06',
          building: 'Edificio Central',
          floor: 'Piso 1',
          capacity: 35,
          classroom_type: 'Teoría',
          status: 'Disponible',
          resources: 'Pizarra acrílica, 35 pupitres, Video beam'
        },
        {
          code_classroom: 'AULA-07',
          name_classroom: 'Aula 07',
          building: 'Edificio Central',
          floor: 'Piso 2',
          capacity: 40,
          classroom_type: 'Teoría',
          status: 'Disponible',
          resources: 'Pizarra acrílica, 40 pupitres, A/C'
        },
        {
          code_classroom: 'LAB-01',
          name_classroom: 'Lab 01',
          building: 'Módulo Tecnológico',
          floor: 'Planta Baja',
          capacity: 25,
          classroom_type: 'Laboratorio',
          status: 'Disponible',
          resources: '25 Computadoras Core i5, Red LAN, Switch Gigabit, Video beam, A/C'
        },
        {
          code_classroom: 'LAB-02',
          name_classroom: 'Lab 02',
          building: 'Módulo Tecnológico',
          floor: 'Planta Baja',
          capacity: 25,
          classroom_type: 'Laboratorio',
          status: 'Disponible',
          resources: '25 Computadoras Core i7, Proyector HDMI, Servidor local, A/C'
        },
        {
          code_classroom: 'LAB-03',
          name_classroom: 'Lab 03',
          building: 'Módulo Tecnológico',
          floor: 'Piso 1',
          capacity: 20,
          classroom_type: 'Laboratorio',
          status: 'Disponible',
          resources: '20 PCs, Kit de Electrónica y Microcontroladores, Osciloscopios'
        },
        {
          code_classroom: 'LAB-04',
          name_classroom: 'Lab 04',
          building: 'Módulo Tecnológico',
          floor: 'Piso 1',
          capacity: 25,
          classroom_type: 'Laboratorio',
          status: 'Disponible',
          resources: '25 Estaciones de trabajo, Equipos de Redes CISCO, A/C'
        },
        {
          code_classroom: 'AUD-01',
          name_classroom: 'Auditorio Simón Bolívar',
          building: 'Edificio Rectoral',
          floor: 'Planta Baja',
          capacity: 120,
          classroom_type: 'Auditorio',
          status: 'Disponible',
          resources: 'Sistema de audio profesional, 2 micrófonos inalámbricos, Proyector láser, 120 butacas'
        }
      ];

      await Classroom.bulkCreate(seedData);
      console.log(`Successfully seeded ${seedData.length} classrooms!`);
    } else {
      console.log(`Classrooms table already has ${count} records. No seed needed.`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error syncing Classroom table:', error);
    process.exit(1);
  }
}

syncClassrooms();
