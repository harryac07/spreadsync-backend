const express = require('express');
const router = express.Router();
const { checkPermission } = require('../../middlewares');

const { projectController } = require('../../controllers');

router.get('/', checkPermission, projectController.getAllProjects);
router.post('/', checkPermission, projectController.createProject);
router.get('/:id', checkPermission, projectController.getProjectById);
router.get(
  '/:id/jobs',
  checkPermission,
  projectController.getAllJobsForProject,
);
router.get('/:id/jobs', projectController.getAllJobsForProject);

module.exports = router;
