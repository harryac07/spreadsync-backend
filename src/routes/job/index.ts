import express from 'express';
import { checkAuth } from '../../middleware';
import { jobController } from '../../controllers';

const router = express.Router();

router.post('/', checkAuth, jobController.createJob);
router.get('/project/:id', checkAuth, jobController.getJobByProjectId);
router.get('/:id', checkAuth, jobController.getJobById);
router.patch('/:id', checkAuth, jobController.updateJob);
router.get('/:id/datasource', checkAuth, jobController.getJobDataSource);
router.post('/:id/datasource', checkAuth, jobController.createDataSource);
router.patch('/:id/datasource/:data_source_id', checkAuth, jobController.updateDataSource);
export {
  router
};
