import express from 'express';
import { checkAuth } from '../../middleware';
import { projectController } from '../../controllers';

const router = express.Router();

router.get('/', checkAuth, projectController.getAllProjects);
router.post('/', checkAuth, projectController.createProject);
router.get('/:id', checkAuth, projectController.getProjectById);
router.get('/:id/jobs', checkAuth, projectController.getAllJobsForProject);
router.get('/:id/jobs', checkAuth, projectController.getAllJobsForProject);

export {
  router
};
