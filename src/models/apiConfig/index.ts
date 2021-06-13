import db from '../db';
import { APIConfig } from 'src/types';

const getAllApiConfigForJob = async (jobId: string): Promise<APIConfig[]> => {
  return db('api_config')
    .select()
    .where({
      job_id: jobId,
    })
};

const getApiConfigById = async (configId: string): Promise<APIConfig[]> => {
  return db('api_config')
    .select()
    .where({
      id: configId,
    })
};

const getApiConfigByType = async (type: 'source' | 'target'): Promise<APIConfig[]> => {
  return db('api_config')
    .select()
    .where({
      type
    })
};

const createApiConfig = async (reqPayload: APIConfig): Promise<APIConfig[]> => {
  return db('api_config').insert(reqPayload).returning('*');
};

const updateApiConfig = async (id: string, reqPayload: any): Promise<APIConfig[]> => {
  return db('api_config').update(reqPayload)
    .where({ id })
    .returning('*');
};
const deleteApiConfigById = async (id: string): Promise<any> => {
  return db('api_config')
    .where({ id })
    .delete()
};
const deleteApiConfigByJob = async (jobId: string): Promise<any> => {
  return db('api_config')
    .where({ job_id: jobId })
    .delete()
};

export default {
  getAllApiConfigForJob,
  getApiConfigById,
  getApiConfigByType,
  createApiConfig,
  updateApiConfig,
  deleteApiConfigById,
  deleteApiConfigByJob,
}