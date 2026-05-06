const { User } = require('../models');

exports.list = async (req, res, next) => {
  try {
    const users = await User.findAll({ limit: 50 });
    res.json(users);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { username, name, password } = req.body;
    const user = await User.create({ username, name, password_hash: password || 'changeme' });
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
};
