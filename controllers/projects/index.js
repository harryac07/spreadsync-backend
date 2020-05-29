const moment = require('moment');

const { Project } = require('../../models');
const { sendEmailToUsers } = require('../../util/sendEmail');

const createProject = async (req, res) => {
  try {
    const { id } = req.locals.user;
    const { account_id } = req.headers;
    if (!account_id) {
      throw new Error('Account id is required!');
    }
    const reqPayload = req.body;
    const { projectPayload = {}, invitedUsers = [] } = reqPayload;

    /* Create projects */
    const projectResponse = await Project.createProject({
      ...projectPayload,
      admin: id,
      account: account_id,
    });
    console.log('Project created: ', projectResponse[0].id);

    /*  Invite users by sending invitation email */
    // Yet to be implemented
    await sendEmailToUsers(invitedUsers, projectResponse[0].id);

    res.status(200).json(projectResponse);
  } catch (e) {
    console.error(e.stack);
    res.status(500).json({
      message: e.message || 'Invalid Request',
    });
  }
};

const getAllProjects = async (req, res) => {
  try {
    const { account_id } = req.headers;

    if (!account_id) {
      throw new Error('Account id is required!');
    }
    const filters = { account_id };
    const projects = await Project.getAllProjectsWithOtherRelations(filters);
    res.status(200).json(projects);
  } catch (e) {
    console.error(e.stack);
    res.status(500).json({
      message: e.message || 'Invalid Request',
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
      message: e.message || 'Invalid Request',
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
      message: e.message || 'Invalid Request',
    });
  }
};

module.exports = {
  createProject,
  getAllProjects,
  getProjectById,
  getAllJobsForProject,
};
