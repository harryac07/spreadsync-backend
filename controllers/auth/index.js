const jwt = require('jsonwebtoken');
const passport = require('passport');
const moment = require('moment');

const { User } = require('../../models');

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
          throw new Error('User exists already! Try log in.');
        }
        res.status(201).json(user);
      } catch (e) {
        console.error(e.stack);
        res.status(500).json({
          message: e.message || 'Invalid Request',
        });
      }
    },
  )(req, res);
};

const login = async (req, res) => {
  passport.authenticate(
    'login',
    { session: false },
    async (err, token, info) => {
      try {
        if (err) {
          throw new Error(err);
        }
        if (!token) {
          throw new Error('User not found. Please provide valid credentials!');
        }
        res.status(200).json({ token });
      } catch (error) {
        console.error(error.stack);
        res.status(500).json({
          message: error.message || 'Invalid Request',
        });
      }
    },
  )(req, res);
};

module.exports = {
  signup,
  login,
};
