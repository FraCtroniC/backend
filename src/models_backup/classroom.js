/** Modelo Sequelize de Aulas y Espacios Físicos */
module.exports = (sequelize, DataTypes) => {
  const Classroom = sequelize.define('Classroom', {
    id_classroom: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    code_classroom: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
    },
    name_classroom: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    building: {
      type: DataTypes.STRING(60),
      allowNull: false,
      defaultValue: 'Edificio Central',
    },
    floor: {
      type: DataTypes.STRING(30),
      allowNull: true,
      defaultValue: 'Planta Baja',
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 30,
      validate: {
        min: 1,
      },
    },
    classroom_type: {
      type: DataTypes.STRING(30), // 'Teoría', 'Laboratorio', 'Taller', 'Auditorio'
      allowNull: false,
      defaultValue: 'Teoría',
    },
    status: {
      type: DataTypes.STRING(30), // 'Disponible', 'Mantenimiento', 'Inhabilitada'
      allowNull: false,
      defaultValue: 'Disponible',
    },
    resources: {
      type: DataTypes.STRING(255),
      allowNull: true, // Ej: 'Pizarra acrílica, 30 pupitres, Video beam, A/C'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'classroom',
    timestamps: false,
  });

  return Classroom;
};
