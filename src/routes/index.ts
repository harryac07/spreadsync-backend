import express from 'express';
import { router as userRouter } from './users';
import { router as projectRouter } from './project';
import { router as authRouter } from './auth';
import { router as accountRouter } from './account';
import { router as jobRouter } from './job';
import { router as workflowRouter } from './workflow';
import { router as googleSheetRouter } from './googleSheet';

const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    message: 'Success',
  });
});

router.use('/users', userRouter);
router.use('/projects', projectRouter);
router.use('/auth', authRouter);
router.use('/accounts', accountRouter);
router.use('/jobs', jobRouter);
router.use('/workflows', workflowRouter);
router.use('/sheets', googleSheetRouter);

export default router;
