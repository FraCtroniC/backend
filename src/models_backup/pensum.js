/** Modelo Sequelize de pensums. */
module.exports = (sequelize, DataTypes) => {
  const Pensum = sequelize.define('Pensum', {
    id_pensum: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    id_career: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      references: {
        model: 'career', // Enlaza el pensum con una carrera específica
        key: 'id_career'
      }
    },
    name_pensum: { 
      type: DataTypes.STRING(50), 
      allowNull: false 
    },
    resolution_date: { 
      type: DataTypes.DATEONLY 
    },
    is_active: { 
      type: DataTypes.BOOLEAN, 
      defaultValue: true 
    },
  }, {
    tableName: 'pensum',
    timestamps: false,
  });

  return Pensum;
};
