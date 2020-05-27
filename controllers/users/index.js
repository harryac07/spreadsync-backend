const { User } = require('../../models');

const getAllUsers = async (req, res) => {
  try {
    const users = await User.getAllUsers();
    res.status(200).json(users);
  } catch (e) {
    console.error(e.stack);
    res.status(500).json({
      message: error.message || 'Invalid Request',
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    // sooner we will catch this from session i.e. req.locals.userId
    const users = await User.getUserById(id);
    res.status(200).json(users);
  } catch (e) {
    console.error(e.stack);
    res.status(500).json({
      message: error.message || 'Invalid Request',
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
};
