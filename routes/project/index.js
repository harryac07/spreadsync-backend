const express = require('express');
const router = express.Router();

const { projectController } = require('../../controllers');

router.get('/', projectController.getAllProjects);
router.get('/:id', projectController.getProjectById);

module.exports = router;
