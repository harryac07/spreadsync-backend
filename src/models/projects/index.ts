import db from '../db';

/**
 * createProject
 * @param {Object}filterObj - Filter object pattern object_columnName (Eg. user_id)
 * @returns {Array}
 */
const createProject = async (reqPayload) => {
  return db('project').insert(reqPayload).returning('*');
};
/**
 * getAllProjects
 * @returns {Array}
 */
const getAllProjects = async (filterObj: { account_id?: string }) => {
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
const getAllProjectsWithOtherRelations = async (filterObj: { account_id?: string }) => {
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
const getProjectById = (projectId = '') => {
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
const getAllJobsByProjectId = (projectId = '') => {
  return db('job')
    .select('job.*', 'user.email as user_email', 'user.id as user_id')
    .leftJoin('user', 'user.id', 'job.created_by')
    .where({
      project: projectId,
    });
};

export default {
  createProject,
  getAllProjects,
  getProjectById,
  getAllProjectsWithOtherRelations,
  getAllJobsByProjectId,
};
