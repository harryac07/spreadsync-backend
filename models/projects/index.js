const db = require('../db');

/**
 * getAllProjects
 * @returns {Array}
 */
const getAllProjects = async () => {
  /*   
    ---Raw query example---
    const userRes = await db.raw(`
      SELECT * FROM "project";
    `);
    return userRes.rows; 
  */
  return db('project').select();
};

/**
 * getAllProjectsWithOtherRelations
 * @returns {Array}
 */
const getAllProjectsWithOtherRelations = async () => {
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
    );
};

/**
 * getProjectById
 * @param {String}projectId - Lookup projectId
 * @returns {Array}
 */
const getProjectById = (projectId = '') => {
  return db('project').select().where({
    id: projectId,
  });
};

module.exports = {
  getAllProjects,
  getProjectById,
  getAllProjectsWithOtherRelations,
};
