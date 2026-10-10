/** Modelo Sequelize de secciones (Mapeado a tt_secci). */
module.exports = (sequelize, DataTypes) => {
  const Section = sequelize.define('Section', {
    id_section: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'secci_id',
    },
    id_period: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'perio_id',
      references: {
        model: 'tm_perio',
        key: 'perio_id'
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
    id_teacher: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'teach_id',
      references: {
        model: 'tm_teach',
        key: 'teach_id'
      }
    },
    section_code: {
      type: DataTypes.STRING(10),
      allowNull: false,
      field: 'secci_cd',
    },
    quota_max: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'secci_qm',
      validate: {
        min: 1
      }
    },
    classroom: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'secci_cr',
    },
    schedule_info: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'secci_ho',
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
  }, {
    tableName: 'tt_secci',
    timestamps: false,
  });

  return Section;
};