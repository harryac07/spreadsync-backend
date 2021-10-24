import jwt from 'jsonwebtoken';
import { Workflow } from '../../models';
import db from '../../models/db';
import { WorkflowType } from 'src/types';
import { BadRequest } from '../../util/CustomError';

const getAllWorkflowForProject = async (req, res, next) => {
  try {
    const { project_id } = req.params;
    const workflows: WorkflowType[] = await Workflow.getAllWorkflowForProject(project_id);
    res.status(200).json(workflows);
  } catch (e) {
    next(e);
  }
};
const getWorkflowById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const workflow: WorkflowType[] = await Workflow.getWorkflowById(id);
    res.status(200).json(workflow);
  } catch (e) {
    next(e);
  }
};

const createWorkflowForProject = async (req, res, next) => {
  try {
    const { id: userId } = req.locals.user;
    const { project_id } = req.params;
    const payload = {
      name: req.body?.name,
      project: project_id,
      workflow: req.body?.workflow,
      created_by: userId
    };
    if (!payload.workflow) {
      throw new BadRequest(`Workflow is required!`);
    }
    if (!payload.name || !payload.project) {
      throw new BadRequest(`Name and project id is required!`);
    }
    const workflow = await Workflow.createWorkflowForProject(payload);
    res.status(201).json(workflow);
  } catch (error) {
    next(error);
  }
};

export {
  getAllWorkflowForProject,
  getWorkflowById,
  createWorkflowForProject
};
