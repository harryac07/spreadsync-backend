import db from '../db';
import { Project, ProjectWithRelations, JobListWithProject } from 'src/types';

/**
 * createProject
 * @param {Object}reqPayload - request payload
 * @returns {Array}
 */
const createProject = async (reqPayload: Pick<Project, "name" | "description" | "account" | "admin">): Promise<Project[]> => {
  return db('project').insert(reqPayload).returning('*');
};

/**
 * deleteProject
 * @param {Object}projectId - project id to delete
 * @param {Object}trx - databse transaction object
 */
const deleteProject = async (projectId: string, trx = db): Promise<any> => {
  return trx('project').where({ id: projectId }).delete();
};

/**
 * getAllProjects
 * @returns {Array}
 */
const getAllProjects = async (filterObj: { account_id?: string } = {}): Promise<Project[]> => {
  return db('project')
    .select()
    .where((builder) => {
      if (filterObj.account_id)
        builder.where('project.account', filterObj.account_id);
    });
};

/**
 * getAllProjectsWithOtherRelations
 * @param {Object}filterObj - Filter object pattern object_columnName (Eg. user_id)
 * @returns {Array}
 */
const getAllProjectsWithOtherRelations = async (filterObj: { account_id?: string, permitted_only?: boolean, user?: string }): Promise<ProjectWithRelations[]> => {
  return db('project')
    .select(
      'project.*',
      'account.name as accountName',
      'account.admin as accountAdmin',
      db.raw('i.count::int as total_members'),
    )
    .leftJoin('account', 'account.id', 'project.account')
    .leftJoin(
      db.raw(`
        (
          SELECT
            u.project,
            u.user,
            (select count(*) from user_involvement ui where ui.project =u.project) as count
          FROM user_involvement u
          WHERE
            u.project_permission ilike '%admin%' or
            u.project_permission ilike '%project%'
          GROUP BY u.project, u.user
        ) i
        ON i.project = project.id
      `),
    )
    .where((builder) => {
      if (filterObj.account_id)
        builder.where('project.account', filterObj.account_id);
      // Allow the project access in UI only if the user has project_* permission exists
      if (filterObj.permitted_only)
        builder.where('i.count', '>', 0);
      if (filterObj.user)
        builder.where({ 'i.user': filterObj.user });
    })
    .orWhere((builder) => {
      if (filterObj.account_id)
        builder.where('project.account', filterObj.account_id);
      if (filterObj.user)
        builder.where({ 'account.admin': filterObj.user });
    });
};

/**
 * getProjectById
 * @param {String}projectId - Lookup projectId
 * @returns {Array}
 */
const getProjectById = (projectId: string): Promise<ProjectWithRelations[]> => {
  return db('project')
    .select('project.*', db.raw('i.count::int as total_members'))
    .leftJoin(
      db.raw(`
      (
        SELECT
          u.project,
          COUNT(*) as count
        FROM user_involvement u
        GROUP BY u.project
      ) i
      ON i.project = project.id
    `),
    )
    .where({
      id: projectId,
    });
};

/**
 * getAllJobsByProjectId
 * @param {String}projectId - Lookup projectId
 * @returns {Array}
 */
const getAllJobsByProjectId = (projectId: string): Promise<JobListWithProject> => {
  return db('job')
    .select('job.*', 'user.email as user_email', 'user.id as user_id', 'job_schedule.frequency_name', 'job_schedule.unit', 'job_schedule.value')
    .distinctOn('job.id')
    .leftJoin('user', 'user.id', 'job.created_by')
    .leftJoin('job_schedule', 'job_schedule.job', 'job.id')
    .where({
      project: projectId,
    });
};

const getAllProjectTeamMembers = async (projectId: string) => {
  return db('user_involvement as u')
    .select(
      'u.*',
      'user.email',
    )
    .leftJoin('user as user', 'user.id', 'u.user')
    .where('u.project', '=', projectId);
};

export default {
  createProject,
  deleteProject,
  getAllProjects,
  getProjectById,
  getAllProjectsWithOtherRelations,
  getAllJobsByProjectId,
  getAllProjectTeamMembers
};
