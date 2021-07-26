import express from 'express';
import { checkAuth } from '../../middleware';
import * as accountController from '../../controllers/account';

const router = express.Router();

router.get('/', checkAuth, accountController.getAllAccounts);
router.post('/', checkAuth, accountController.createAccount);
router.patch('/:id', checkAuth, accountController.updateAccount);
router.delete('/:id', checkAuth, accountController.deleteAccount);
router.get('/find/:name', accountController.getAccountByAccountName);

export { router };
