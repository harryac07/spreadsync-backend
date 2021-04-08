import express from 'express';
import { checkAuth } from '../../middleware';
import * as authController from '../../controllers/auth';

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/login/google', authController.loginAuth);
router.post('/activate-user', authController.activateUser);

router.post('/social/:name', checkAuth, authController.saveSocialAuth);
router.get('/social/:name/job/:job_id', checkAuth, authController.getSocialAuthByJobId); // name: google

export { router };
