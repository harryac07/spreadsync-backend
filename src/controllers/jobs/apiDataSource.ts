import knex from 'knex';
import axios from 'axios';
import { APIConfig, Job } from '../../models';
import { APIConfig as APIConfigTypes } from 'src/types';

const createApiConfig = async (req, res, next) => {
  try {
    const reqPayload: APIConfigTypes = req.body;
    if (!reqPayload.job_id) {
      throw new Error('Job is is required!');
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

    /* Check API info from DB using api config id */
    const [config]: APIConfigTypes[] = await APIConfig.getApiConfigById(id);

    const [parsedParams] = JSON.parse(config.params) || [];
    const [parsedHeaders] = JSON.parse(config.headers) || [];
    const qs = new URLSearchParams(parsedParams)?.toString();
    const params = qs?.includes('null=') ? '' : `?${qs}`;

    /* Make AJAX request for connection check */
    if (config.method === 'GET') {
      await axios.get(`${config.endpoint}${params}`, {
        headers: parsedHeaders
      })
    } else if (config.method === 'POST') {
      const body = JSON.parse(config.body) || {};
      await axios.post(`${config.endpoint}${params}`, body, {
        headers: parsedHeaders
      })
    } else {
      throw new Error('Only GET and POST methods are supported!');
    }
    res.status(200).json({ data: 'connected successfully!' });
  } catch (e) {
    next(e);
  }
}

export {
  createApiConfig,
  getApiConfigByJobId,
  updateAPIConfig,
  checkApiConnection,
}

