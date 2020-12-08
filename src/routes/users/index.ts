import express from 'express';
const router = express.Router();

import { usersController } from '../../controllers';
import { checkAuth } from '../../middleware';

router.get('/', checkAuth, usersController.getAllUsers);
router.get('/:id', checkAuth, usersController.getUserById);
router.get('/:id/accounts', checkAuth, usersController.getAllAccountsForUser);

export { router };
