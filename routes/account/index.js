const express = require('express');
const router = express.Router();

const accountController = require('../../controllers/account');

router.get('/', accountController.getAllAccounts);
router.post('/', accountController.createAccount);

module.exports = router;
