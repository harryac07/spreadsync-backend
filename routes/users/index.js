const express = require('express');
const router = express.Router();
const passport = require('passport');

const { usersController } = require('../../controllers');

router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  usersController.getAllUsers,
);
router.post('/signup', usersController.signup);
router.post('/login', usersController.login);
router.get(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  usersController.getUserById,
);

module.exports = router;
