import dbClient from '../../models/db';
import { Project, User } from '../../models';
import { Project as ProjectTypes, ProjectWithRelations, JobListWithProject } from 'src/types';
import {
  sendInvitationEmailToUser,
  notifyUserForProjectInvitation,
  generateInvitationToken,
} from '../../util/';


type InviteUserToProject = (
  account_id: string,
  projectId: string,
  projectName: string,
  invitedUsers: { email?: string, permission?: string }[],
  adminEmail: string,
) => Promise<void>;

export const _inviteUserToProject: InviteUserToProject = async (
  account_id,
  projectId,
  projectName,
  invitedUsers,
  adminEmail,
) => {
  /*  Invite users by sending invitation email */

  await dbClient.transaction(async (trx) => {
    for (const eachUser of invitedUsers) {
      const { email = "", permission = [] } = eachUser as any;
      // check if user exists already in the system
      const userCheckRes = await User.getUserByEmail(email);
      const userExists = userCheckRes[0];
      let user = userExists;

      if (!userExists) {
        // create user with inactive status
        const userRes = await User.createUser(
          {
            email,
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
          ...adminEmail === email ? {
            project_role: 'Admin',
            project_permission: 'admin'
          } : {
            project_role: 'Developer',
            project_permission: permission?.length ? permission?.join(',') : ''
          },
        },
        trx,
      );
      const token = generateInvitationToken({
        account_id,
        email,
      });
      if (userExists) {
        /* AdminEmail is the one who is creating the project. No need to send invitation email to admin */
        if (adminEmail !== email) {
          await notifyUserForProjectInvitation({
            email,
            project: projectName,
          });
        }
      } else {
        await sendInvitationEmailToUser({
          email,
          token,
          project: projectName
        });
      }
    }
  });
};
const createProject = async (req, res, next) => {
  try {
    const { id, email } = req.locals.user;
    const { account_id } = req.headers;
    if (!account_id) {
      throw new Error('Account id is required!');
    }
    const reqPayload = req.body;
    const { projectPayload = {}, invitedUsers = [] } = reqPayload;

    /* Create project */
    const projectResponse: ProjectTypes[] = await Project.createProject({
      ...projectPayload,
      admin: id,
      account: account_id,
    });

    await _inviteUserToProject(
      account_id,
      projectResponse[0].id,
      projectResponse[0].name,
      [{ email }],
      email
    );

    res.status(200).json(projectResponse);
  } catch (e) {
    next(e);
  }
};

const getAllProjects = async (req, res, next) => {
  try {
    const { account_id } = req.headers;

    if (!account_id) {
      throw new Error('Account id is required!');
    }
    const filters = { account_id };
    const projects: ProjectWithRelations[] = await Project.getAllProjectsWithOtherRelations(filters);
    res.status(200).json(projects);
  } catch (e) {
    next(e);
  }
};

const getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const projects: ProjectWithRelations[] = await Project.getProjectById(id);
    res.status(200).json(projects);
  } catch (e) {
    next(e);
  }
};

const getAllJobsForProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const jobs: JobListWithProject = await Project.getAllJobsByProjectId(id);
    res.status(200).json(jobs);
  } catch (e) {
    next(e);
  }
};

const getAllProjectTeamMembers = async (req, res, next) => {
  try {
    const { id } = req.params;
    const projectMembers = await Project.getAllProjectTeamMembers(id);
    res.status(200).json(projectMembers);
  } catch (e) {
    next(e);
  }
}

const inviteProjectTeamMembers = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email } = req.locals.user;
    const payload: {
      accountId: string,
      projectName: string,
      invitedUsers: any[],
      projectId?: string;
    } = req.body;

    if (!payload?.accountId || id === 'undefined') {
      throw new Error('Account id and project id is required');
    }

    await _inviteUserToProject(
      payload?.accountId,
      id,
      payload?.projectName,
      payload?.invitedUsers ?? [],
      email // admin email
    );

    res.status(200).json({ message: 'Invitation sent successfully' });
  } catch (e) {
    next(e);
  }
}

export {
  createProject,
  getAllProjects,
  getProjectById,
  getAllJobsForProject,
  getAllProjectTeamMembers,
  inviteProjectTeamMembers,
};
