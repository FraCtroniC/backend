const { AcademicTitle } = require('../models');

// List all academic titles
exports.list = async (req, res, next) => {
  try {
    const titles = await AcademicTitle.findAll({
      order: [['id_academic_title', 'ASC']]
    });
    res.json(titles);
  } catch (err) {
    next(err);
  }
};
