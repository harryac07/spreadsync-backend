const express = require('express');
const router = express.Router();
const { checkAuth } = require('../../middleware');

const accountController = require('../../controllers/account');

router.get('/', checkAuth, accountController.getAllAccounts);
router.post('/', checkAuth, accountController.createAccount);
router.get('/find/:name', accountController.getAccountByAccountName);

module.exports = router;
