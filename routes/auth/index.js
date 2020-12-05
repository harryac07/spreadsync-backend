const express = require('express');
const router = express.Router();
const passport = require('passport');

const authController = require('../../controllers/auth');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/login/google', authController.loginAuth);
router.post('/activate-user', authController.activateUser);

module.exports = router;
