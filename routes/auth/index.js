const express = require('express');
const router = express.Router();

const authController = require('../../controllers/auth');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/activate-user', authController.activateUser);

module.exports = router;
