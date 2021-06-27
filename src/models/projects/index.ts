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
const getAllProjectsWithOtherRelations = async (filterObj: { account_id?: string }): Promise<ProjectWithRelations[]> => {
  return db('project')
    .select(
      'project.*',
      'account.name as accountName',
      db.raw('i.count::int as total_members'),
    )
    .leftJoin('account', 'account.id', 'project.account')
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
    .where((builder) => {
      if (filterObj.account_id)
        builder.where('project.account', filterObj.account_id);
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
  getAllProjects,
  getProjectById,
  getAllProjectsWithOtherRelations,
  getAllJobsByProjectId,
  getAllProjectTeamMembers
};
