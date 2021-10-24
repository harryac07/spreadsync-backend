import db from '../db';
import Knex from 'knex';
import { WorkflowContent, WorkflowType } from 'src/types';

const getAllWorkflowForProject = async (projectId: string): Promise<WorkflowType[]> => {
  return db('workflow as w')
    .select(
      'w.id',
      'w.name',
      'w.project',
      'w.name',
      'w.workflow',
      'user.email as created_by',
    )
    .where('w.project', projectId)
    .innerJoin('user', 'user.id', 'w.created_by')
};

const getWorkflowById = async (workflowId: string): Promise<WorkflowType[]> => {
  return db('workflow as w')
    .select(
      'w.id',
      'w.name',
      'w.project',
      'p.name as project_name',
      'w.name',
      'w.workflow',
      'user.email as created_by',
    )
    .where('w.id', workflowId)
    .innerJoin('user', 'user.id', 'w.created_by')
    .innerJoin('project as p', 'p.id', 'w.project')
};

const createWorkflowForProject = async (payload: Omit<WorkflowType, 'id' | 'created_on'>): Promise<WorkflowType[]> => {
  return db('workflow')
    .insert(payload).returning('*')
}

export default {
  getAllWorkflowForProject,
  getWorkflowById,
  createWorkflowForProject
}