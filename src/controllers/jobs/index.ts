import dbClient from '../../models/db';
import { Job } from '../../models';
import { Job as JobTypes, CreateJobPayload, DataSource, JobSchedule } from 'src/types';

const createJob = async (req, res) => {
  try {
    /* 
      project: '121212',
      data_destination: "spreadsheet"
      data_source: "database"
      description: "sasasas"
      name: "hari"
      type: "test"
      unit: "hours"
      value: 1,
    */
    const reqPayload = {
      ...req.body,
      created_by: req.locals.user
    };
    if (!reqPayload.project) {
      throw new Error('Project id is required!');
    }
    const createJobPayload: CreateJobPayload = {
      name: reqPayload.name,
      description: reqPayload.description,
      type: reqPayload.type,
      project: reqPayload.project,
      script: reqPayload.script || '',
      data_source: reqPayload.data_source || '',
      data_target: reqPayload.data_target || '',
      created_by: req.locals.user.id,
    }

    // create job
    const job: JobTypes[] = await Job.createJob(createJobPayload);

    // create job schedule
    const jobSchedulePayload = {
      job: job[0].id,
      frequency_name: 'fixed',
      value: reqPayload.value,
      unit: reqPayload.unit,
    }
    await Job.createJobSchedule(jobSchedulePayload);

    res.status(200).json(job);
  } catch (e) {
    console.error(e.stack);
    res.status(500).json({
      message: e.message || 'Invalid Request',
    });
  }
};
const getAllJobs = async (req, res) => {
  try {
    const { account_id } = req.headers;

    if (!account_id) {
      throw new Error('Account id is required!');
    }
    const jobs: JobTypes[] = await Job.getAllJobs();
    res.status(200).json(jobs);
  } catch (e) {
    console.error(e.stack);
    res.status(500).json({
      message: e.message || 'Invalid Request',
    });
  }
};

const getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new Error('Job id is required!');
    }
    const job: JobTypes[] = await Job.getJobById(id);
    res.status(200).json(job);
  } catch (e) {
    console.error(e.stack);
    res.status(500).json({
      message: e.message || 'Invalid Request',
    });
  }
};

const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const reqPayload = req.body;

    if (!id) {
      throw new Error('Job id is required!');
    }

    const jobSchedulePayload = {
      frequency_name: 'fixed',
      value: reqPayload.value,
      unit: reqPayload.unit,
    }
    await Job.updateJobSchedule(id, jobSchedulePayload);

    const updateJobPayload: Omit<CreateJobPayload, 'created_by'> = {
      name: reqPayload.name,
      description: reqPayload.description,
      type: reqPayload.type,
      project: reqPayload.project,
      script: reqPayload.script || '',
      data_source: reqPayload.data_source || '',
      data_target: reqPayload.data_target || '',
    }
    const job: JobTypes[] = await Job.updateJobDetail(id, updateJobPayload);
    res.status(200).json(job);
  } catch (e) {
    console.error(e.stack);
    res.status(500).json({
      message: e.message || 'Invalid Request',
    });
  }
};

const getJobByProjectId = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new Error('Project id is required!');
    }
    const jobs: JobTypes[] = await Job.getJobByProjectId(id);
    res.status(200).json(jobs);
  } catch (e) {
    console.error(e.stack);
    res.status(500).json({
      message: e.message || 'Invalid Request',
    });
  }
};

const createDataSource = async (req, res) => {
  try {
    const { id } = req.params;
    const reqPayload = req.body;
    if (!id) {
      throw new Error('Job id is required!');
    }
    const dataSourcePayload = {
      job: id,
      database_type: reqPayload.database_type,
      is_ssl: reqPayload.database_extra === 'ssl',
      alias_name: reqPayload.alias_name,
      database_host: reqPayload.database_host,
      database_name: reqPayload.database_name,
      database_port: reqPayload.database_port,
      database_user: reqPayload.database_user,
      database_password: reqPayload.database_password,
      is_ssh: reqPayload.database_extra === 'ssh',
      ssh_host: reqPayload.ssh_host,
      ssh_username: reqPayload.ssh_username,
      ssh_password: reqPayload.ssh_password,
      ssh_port: reqPayload.ssh_port,
      ssh_key: reqPayload.ssh_key,
      data_type: reqPayload.data_type,
    }
    const dataSource: DataSource[] = await Job.createJobDataSource(dataSourcePayload);
    res.status(200).json(dataSource);
  } catch (e) {
    console.error(e.stack);
    res.status(500).json({
      message: e.message || 'Invalid Request',
    });
  }
}


const updateDataSource = async (req, res) => {
  try {
    const reqPayload = req.body;
    const { id: jobId, data_source_id: dataSourceId } = req.params;
    const isSSH = reqPayload?.database_extra === 'ssh';
    const dataSourcePayload = {
      job: jobId,
      database_type: reqPayload.database_type,
      is_ssl: reqPayload.database_extra === 'ssl',
      alias_name: reqPayload.alias_name,
      database_host: reqPayload.database_host,
      database_name: reqPayload.database_name,
      database_port: reqPayload.database_port,
      database_user: reqPayload.database_user,
      database_password: reqPayload.database_password,
      is_ssh: isSSH,
      ssh_host: isSSH ? reqPayload.ssh_host : '',
      ssh_username: isSSH ? reqPayload.ssh_username : '',
      ssh_password: isSSH ? reqPayload.ssh_password : '',
      ssh_port: isSSH ? reqPayload.ssh_port : '',
      ssh_key: isSSH ? reqPayload.ssh_key : '',
      data_type: reqPayload.data_type || 'source',
    }
    const dataSource: DataSource[] = await Job.updateJobDataSource(dataSourceId, dataSourcePayload);
    res.status(200).json(dataSource);
  } catch (e) {
    console.error(e.stack);
    res.status(500).json({
      message: e.message || 'Invalid Request',
    });
  }
}

const getJobDataSource = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new Error('Job id is required!');
    }
    const jobDataSource: DataSource[] = await Job.getJobDataSource(id);
    res.status(200).json(jobDataSource);
  } catch (e) {
    console.error(e.stack);
    res.status(500).json({
      message: e.message || 'Invalid Request',
    });
  }
}

export { getJobById, getJobByProjectId, createJob, updateJob, createDataSource, getJobDataSource, updateDataSource }