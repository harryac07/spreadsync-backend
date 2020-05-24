const express = require('express');
const router = express.Router();

const { projectController } = require('../../controllers');

router.get('/', projectController.getAllProjects);
router.post('/', projectController.createProject);
router.get('/:id', projectController.getProjectById);
router.get('/:id/jobs', projectController.getAllJobsForProject);

module.exports = router;
