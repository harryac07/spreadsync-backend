// import * as  moment from 'moment';
import db from '../../models/db';
import { Project, User } from '../../models';
import {
  sendInvitationEmailToUser,
  notifyUserForProjectInvitation,
  generateInvitationToken,
} from '../../util/';

export const _inviteUserToProject = async (
  account_id,
  projectId,
  projectName,
  invitedUsers,
) => {
  /*  Invite users by sending invitation email */

  await db.transaction(async (trx) => {
    for (const eachUser of invitedUsers) {
      // check if user exists already in the system
      const userCheckRes = await User.getUserByEmail(eachUser);
      const userExists = userCheckRes[0];
      let user = userExists;

      if (!userExists) {
        // create user with inactive status
        const userRes = await User.createUser(
          {
            email: eachUser,
            password: 'temp password',
          },
          trx,
        );
        user = userRes[0];
      }

      // create user project involvement
      await User.createProjectInvolvement(
        {
          user: user.id,
          project: projectId,
          account: account_id,
        },
        trx,
      );
      const token = generateInvitationToken({
        account_id,
        email: eachUser,
      });
      if (userExists) {
        await notifyUserForProjectInvitation({
          email: eachUser,
          project: projectName,
        });
      } else {
        await sendInvitationEmailToUser({
          email: eachUser,
          project: projectName,
          token,
        });
      }
    }
  });
};
const createProject = async (req, res) => {
  try {
    const { id } = req.locals.user;
    const { account_id } = req.headers;
    if (!account_id) {
      throw new Error('Account id is required!');
    }
    const reqPayload = req.body;
    const { projectPayload = {}, invitedUsers = [] } = reqPayload;

    /* Create project */
    const projectResponse = await Project.createProject({
      ...projectPayload,
      admin: id,
      account: account_id,
    });
    console.log('Project created: ', projectResponse[0].name);

    await _inviteUserToProject(
      account_id,
      projectResponse[0].id,
      projectResponse[0].name,
      invitedUsers,
    );

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

export {
  createProject,
  getAllProjects,
  getProjectById,
  getAllJobsForProject,
};
