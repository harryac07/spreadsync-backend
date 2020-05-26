const express = require('express');
const router = express.Router();
const { checkAuth } = require('../../middleware');

const { projectController } = require('../../controllers');

router.get('/', checkAuth, projectController.getAllProjects);
router.post('/', checkAuth, projectController.createProject);
router.get('/:id', checkAuth, projectController.getProjectById);
router.get('/:id/jobs', checkAuth, projectController.getAllJobsForProject);
router.get('/:id/jobs', checkAuth, projectController.getAllJobsForProject);

module.exports = router;
