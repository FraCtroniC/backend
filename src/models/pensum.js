/** Modelo Sequelize de pensums (Mapeado a tm_pensu). */
module.exports = (sequelize, DataTypes) => {
  const Pensum = sequelize.define('Pensum', {
    id_pensum: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true,
      field: 'pensu_id',
    },
    id_career: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      field: 'caree_id',
      references: {
        model: 'tm_caree',
        key: 'caree_id'
      }
    },
    name_pensum: { 
      type: DataTypes.STRING(50), 
      allowNull: false,
      field: 'pensu_nm',
    },
    resolution_date: { 
      type: DataTypes.DATEONLY,
      field: 'pensu_rd',
    },
    is_active: { 
      type: DataTypes.BOOLEAN, 
      defaultValue: true,
      field: 'pensu_st',
    },
  }, {
    tableName: 'tm_pensu',
    timestamps: false,
  });

  return Pensum;
};
