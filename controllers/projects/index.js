const { Project } = require('../../models');

const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.getAllProjectsWithOtherRelations();
    res.status(200).json(projects);
  } catch (e) {
    console.error(e.stack);
    res.status(500).json({
      message: 'Invalid Request',
    });
  }
};

const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    // sooner we will catch this from session i.e. req.locals.userId
    const projects = await Project.getProjectById(id);
    res.status(200).json(projects);
  } catch (e) {
    console.error(e.stack);
    res.status(500).json({
      message: 'Invalid Request',
    });
  }
};

module.exports = {
  getAllProjects,
  getProjectById,
};
