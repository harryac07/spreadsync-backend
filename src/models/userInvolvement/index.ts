import db from '../db';
import Knex from 'knex';
import { Account, AccountPayload } from 'src/types';

/**
 * getAllUserInvolvement
 * @param {Object}filterObj - Filter object pattern object_columnName (Eg. user_id)
 * @returns {Array}
 */
const getAllUserInvolvement = async (filterObj: { projectId?: string, userId?: string }): Promise<any[]> => {
  return db('user_involvement as ui')
    .select(
      'ui.*',
      'user.firstname', 'user.lastname', 'user.is_active',
      'project.name',
    )
    .where((builder) => {
      if (filterObj.projectId) {
        builder.where('ui.project', filterObj.projectId);
      }
      if (filterObj.userId) {
        builder.where('ui.user', filterObj.userId);
      }
    })
    .innerJoin('project', 'project.id', 'ui.project')
    .innerJoin('user', 'user.id', 'ui.user')
};

export default { getAllUserInvolvement }