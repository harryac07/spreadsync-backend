const express = require('express');
const router = express.Router();

const { usersController } = require('../../controllers');
const { checkAuth } = require('../../middleware');

router.get('/', checkAuth, usersController.getAllUsers);
router.get('/:id', checkAuth, usersController.getUserById);
router.get('/:id/accounts', checkAuth, usersController.getAllAccountsForUser);

module.exports = router;
