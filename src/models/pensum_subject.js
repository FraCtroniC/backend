/** Modelo Sequelize de materias por pensum (Mapeado a tt_pesub). */
module.exports = (sequelize, DataTypes) => {
  const PensumSubject = sequelize.define('PensumSubject', {
    id_pensum_subject: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true,
      field: 'pesub_id',
    },
    id_pensum: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      field: 'pensu_id',
      references: {
        model: 'tm_pensu',
        key: 'pensu_id'
      }
    },
    id_subject: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      field: 'subje_id',
      references: {
        model: 'tm_subje',
        key: 'subje_id'
      }
    },
    id_semester: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      field: 'pesub_sm',
      references: {
        model: 'tm_semes',
        key: 'semes_id'
      }
    },
    code_subject: { 
      type: DataTypes.STRING(20), 
      allowNull: false,
      field: 'pesub_cd',
    },
  }, {
    tableName: 'tt_pesub',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['pensu_id', 'pesub_cd']
      }
    ]
  });

  return PensumSubject;
};
