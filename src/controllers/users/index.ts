import { User } from '../../models';

const getAllUsers = async (req, res) => {
  try {
    const { projectId } = req.query;
    if (projectId) {
      const users = await User.getAllUsers();
    }
    const users = await User.getAllUsers();
    res.status(200).json(users);
  } catch (e) {
    console.error(e.stack);
    res.status(500).json({
      message: e.message || 'Invalid Request',
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
      message: e.message || 'Invalid Request',
    });
  }
};
const getAllAccountsForUser = async (req, res) => {
  try {
    const { id } = req.params;
    // sooner we will catch this from session i.e. req.locals.userId
    const accounts = await User.getAllAccountsForUser(id);
    res.status(200).json(accounts);
  } catch (e) {
    console.error(e.stack);
    res.status(500).json({
      message: e.message || 'Invalid Request',
    });
  }
};

export {
  getAllUsers,
  getUserById,
  getAllAccountsForUser,
};
