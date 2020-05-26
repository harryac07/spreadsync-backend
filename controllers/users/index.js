const { User } = require('../../models');
const jwt = require('jsonwebtoken');
const passport = require('passport');

const getAllUsers = async (req, res) => {
  try {
    const users = await User.getAllUsers();
    res.status(200).json(users);
  } catch (e) {
    console.error(e.stack);
    res.status(500).json({
      message: 'Invalid Request',
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
      message: 'Invalid Request',
    });
  }
};

const signup = async (req, res) => {
  passport.authenticate(
    'signup',
    { session: false },
    async (err, user, info) => {
      try {
        if (err) {
          throw new Error(err);
        }
        if (!user) {
          throw new Error('Signup failed. Please try again!');
        }
        console.log('ctrl user: ', user);
        res.status(201).json(user);
      } catch (e) {
        console.error(e.stack);
        res.status(500).json({
          message: 'Invalid Request',
        });
      }
    },
  )(req, res);
};

const login = async (req, res) => {
  passport.authenticate(
    'login',
    { session: false },
    async (err, user, info) => {
      try {
        if (err) {
          throw new Error(err);
        }
        if (!user) {
          throw new Error('User not found. Please provide valid credentials!');
        }
        const token = await new Promise((resolve, reject) => {
          req.login(user, { session: false }, async (error) => {
            if (error) {
              reject(error);
            } else {
              const body = { id: user.id, email: user.email };
              const token = jwt.sign({ user: body }, process.env.JWT_SECRET, {
                expiresIn: '24h',
              });
              resolve(token);
            }
          });
        });
        res.status(200).json({ token });
      } catch (error) {
        console.error(e.stack);
        res.status(500).json({
          message: 'Invalid Request',
        });
      }
    },
  )(req, res);
};

module.exports = {
  getAllUsers,
  getUserById,
  signup,
  login,
};
