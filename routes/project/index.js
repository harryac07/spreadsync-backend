const express = require('express');
const router = express.Router();
const { checkPermission } = require('../../middlewares');

const { projectController } = require('../../controllers');

router.get('/', checkPermission, projectController.getAllProjects);
router.post('/', checkPermission, projectController.createProject);
router.get('/:id', projectController.getProjectById);
router.get('/:id/jobs', projectController.getAllJobsForProject);

module.exports = router;
