/** Modelo Sequelize de carreras (Mapeado a tm_caree). */
module.exports = (sequelize, DataTypes) => {
  const Career = sequelize.define('Career', {
    id_career: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true,
      field: 'caree_id',
    },
    code_career: { 
      type: DataTypes.STRING(20), 
      allowNull: false, 
      unique: true,
      field: 'caree_cd',
    },
    name_career: { 
      type: DataTypes.STRING(100), 
      allowNull: false,
      field: 'caree_nm',
    },
    total_semesters: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      field: 'caree_ts',
      validate: {
        min: 1,
        max: 15
      }
    },
    is_active: { 
      type: DataTypes.BOOLEAN, 
      defaultValue: true,
      field: 'caree_st',
    },
  }, {
    tableName: 'tm_caree',
    timestamps: false,
  });

  return Career;
};
