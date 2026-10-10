/** Modelo Sequelize de Aulas y Espacios Físicos (Mapeado a tm_class) */
module.exports = (sequelize, DataTypes) => {
  const Classroom = sequelize.define('Classroom', {
    id_classroom: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'class_id',
    },
    code_classroom: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
      field: 'class_cd',
    },
    name_classroom: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'class_nm',
    },
    building: {
      type: DataTypes.STRING(60),
      allowNull: false,
      defaultValue: 'Edificio Central',
      field: 'class_bd',
    },
    floor: {
      type: DataTypes.STRING(30),
      allowNull: true,
      defaultValue: 'Planta Baja',
      field: 'class_fl',
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 30,
      field: 'class_cp',
      validate: {
        min: 1,
      },
    },
    classroom_type: {
      type: DataTypes.STRING(30), // 'Teoría', 'Laboratorio', 'Taller', 'Auditorio'
      allowNull: false,
      defaultValue: 'Teoría',
      field: 'class_tp',
    },
    status: {
      type: DataTypes.STRING(30), // 'Disponible', 'Mantenimiento', 'Inhabilitada'
      allowNull: false,
      defaultValue: 'Disponible',
      field: 'class_st',
    },
    resources: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'class_rs',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'class_nt',
    },
  }, {
    tableName: 'tm_class',
    timestamps: false,
  });

  return Classroom;
};
