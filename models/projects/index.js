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
    .select('project.*', 'account.name as accountName')
    .leftJoin('account', 'account.id', 'project.account');
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
