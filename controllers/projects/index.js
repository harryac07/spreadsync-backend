const moment = require('moment');

const { Project } = require('../../models');
const { sendEmailToUsers } = require('../../util/sendEmail');

const createProject = async (req, res) => {
  try {
    const { id, account } = req.locals.user;
    const reqPayload = req.body;
    const { projectPayload = {}, invitedUsers = [] } = reqPayload;

    /* Create projects */
    const projectResponse = await Project.createProject({
      ...projectPayload,
      admin: id,
      account: account,
    });
    console.log('Project created: ', projectResponse[0].id);

    /*  Invite users by sending invitation email */
    // Yet to be implemented
    await sendEmailToUsers(invitedUsers, projectResponse[0].id);

    res.status(200).json(projectResponse);
  } catch (e) {
    console.error(e.stack);
    res.status(500).json({
      message: error.message || 'Invalid Request',
    });
  }
};

const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.getAllProjectsWithOtherRelations();
    res.status(200).json(projects);
  } catch (e) {
    console.error(e.stack);
    res.status(500).json({
      message: error.message || 'Invalid Request',
    });
  }
};

const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const projects = await Project.getProjectById(id);
    res.status(200).json(projects);
  } catch (e) {
    console.error(e.stack);
    res.status(500).json({
      message: error.message || 'Invalid Request',
    });
  }
};

const getAllJobsForProject = async (req, res) => {
  try {
    const { id } = req.params;
    const jobs = await Project.getAllJobsByProjectId(id);
    res.status(200).json(jobs);
  } catch (e) {
    console.error(e.stack);
    res.status(500).json({
      message: error.message || 'Invalid Request',
    });
  }
};

module.exports = {
  createProject,
  getAllProjects,
  getProjectById,
  getAllJobsForProject,
};
