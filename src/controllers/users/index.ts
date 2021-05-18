import { User } from '../../models';

const getAllUsers = async (req, res, next) => {
  try {
    const { projectId } = req.query;
    if (projectId) {
      const users = await User.getAllUsers();
    }
    const users = await User.getAllUsers();
    res.status(200).json(users);
  } catch (e) {
    next(e);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    // sooner we will catch this from session i.e. req.locals.userId
    const users = await User.getUserById(id);
    res.status(200).json(users);
  } catch (e) {
    next(e);
  }
};
const getAllAccountsForUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    // sooner we will catch this from session i.e. req.locals.userId
    const accounts = await User.getAllAccountsForUser(id);
    res.status(200).json(accounts);
  } catch (e) {
    next(e);
  }
};

export {
  getAllUsers,
  getUserById,
  getAllAccountsForUser,
};
