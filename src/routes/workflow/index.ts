import express from 'express';
import { checkAuth } from '../../middleware';
import * as workflowController from '../../controllers/workflow';

const router = express.Router();

router.get('/project/:project_id', checkAuth, workflowController.getAllWorkflowForProject);
router.post('/project/:project_id/workflow', checkAuth, workflowController.createWorkflowForProject);
router.get('/:id', checkAuth, workflowController.getWorkflowById);

export { router };
