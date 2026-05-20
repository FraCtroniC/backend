/** Modelo Sequelize de carreras. */
module.exports = (sequelize, DataTypes) => {
  const Career = sequelize.define('Career', {
    id_career: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    code_career: { 
      type: DataTypes.STRING(20), 
      allowNull: false, 
      unique: true // Ejemplo: 'PNF-SIS', 'PNF-ADM'
    },
    name_career: { 
      type: DataTypes.STRING(100), 
      allowNull: false 
    },
    total_semesters: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      validate: {
        min: 1,
        max: 15 // Un límite razonable para carreras universitarias
      }
    },
    is_active: { 
      type: DataTypes.BOOLEAN, 
      defaultValue: true 
    },
  }, {
    tableName: 'career',
    timestamps: false,
  });

  return Career;
};
