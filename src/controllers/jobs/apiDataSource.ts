import knex from 'knex';
import axios from 'axios';
import { APIConfig, Job } from '../../models';
import { BadRequest } from '../../util/CustomError';
import { APIConfig as APIConfigTypes } from 'src/types';

const createApiConfig = async (req, res, next) => {
  try {
    const reqPayload: APIConfigTypes = req.body;
    if (!reqPayload.job_id) {
      throw new BadRequest('Job is is required!');
    }
    await APIConfig.createApiConfig(reqPayload);
    /* Update job */
    await Job.updateJobDetail(reqPayload.job_id, {
      [`is_data_${reqPayload.type}_configured`]: true
    });
    res.status(200).json({ data: 'API config created successfully!' });
  } catch (e) {
    next(e);
  }
}

const getApiConfigByJobId = async (req, res, next) => {
  try {
    const { id: jobId } = req.params;
    const apiConfigs = await APIConfig.getAllApiConfigForJob(jobId);
    res.status(200).json(apiConfigs);
  } catch (e) {
    next(e);
  }
}

const updateAPIConfig = async (req, res, next) => {
  try {
    const { apiconfig_id: id } = req.params;
    const reqPayload = req.body;
    const apiConfigs: APIConfigTypes[] = await APIConfig.updateApiConfig(id, reqPayload);
    res.status(200).json(apiConfigs);
  } catch (e) {
    next(e);
  }
}

const checkApiConnection = async (req, res, next) => {
  try {
    const { apiconfig_id: id } = req.params;
    await _getDataFromAPIEndpoint(id);
    res.status(200).json({ data: 'connected successfully!' });
  } catch (e) {
    next(e);
  }
}

const _getDataFromAPIEndpoint = async (apiConfigId: string): Promise<any[]> => {
  /* Check API info from DB using api config id */
  const [config]: APIConfigTypes[] = await APIConfig.getApiConfigById(apiConfigId);

  const [parsedParams] = JSON.parse(config.params) || [];
  const [parsedHeaders] = JSON.parse(config.headers) || [];
  const qs = new URLSearchParams(parsedParams)?.toString();
  const params = qs?.includes('null=') ? '' : `?${qs}`;

  let response: any = null;
  if (config.method === 'GET') {
    response = await axios.get(`${config.endpoint}${params}`, {
      headers: parsedHeaders
    })
  } else if (config.method === 'POST') {
    const body = JSON.parse(config.body) || {};
    response = await axios.post(`${config.endpoint}${params}`, body, {
      headers: parsedHeaders
    })
  } else {
    throw new BadRequest('Only GET and POST methods are supported!');
  }
  return response?.data ?? [];
}

export {
  createApiConfig,
  getApiConfigByJobId,
  updateAPIConfig,
  checkApiConnection,

  _getDataFromAPIEndpoint
}

