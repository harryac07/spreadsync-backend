import db from '../db';
import { Job, CreateJobPayload, JobSchedule, DataSource as DataSourceTypes, SpreadsheetConfig } from 'src/types';

type JobScheduleReqPayloadProps = Omit<JobSchedule, 'id' | 'created_on' | 'updated_on'>

const getAllJobs = async (): Promise<Job[]> => {
  return db('job')
    .select();
};
const createJob = async (reqPayload: CreateJobPayload): Promise<Job[]> => {
  return db('job').insert(reqPayload).returning('*');
};
const cloneJobByJobId = async (jobId: string, reqPayload: { userId?: string }): Promise<any> => {
  await db.transaction(async (trx) => {
    // create new job out of existing job
    const jobRes = await trx('job').select(
      'name', 'description', 'type', 'project', 'data_source', 'data_target', 'is_data_source_configured', 'is_data_target_configured'
    ).where({ id: jobId });
    const jobToBeCloned = jobRes.map(each => ({
      ...each,
      name: `Copy of ${each.name}`,
      created_by: reqPayload?.userId
    }));
    const [newJob] = await trx('job').insert(jobToBeCloned).returning('*');
    const newJobId = newJob?.id;

    // create job schedule
    const jobScheduleRes = await trx('job_schedule').select(
      'job', 'frequency_name', 'value', 'unit'
    ).where({ job: jobId });
    const jobScheduleToBeCloned = jobScheduleRes.map(each => ({
      ...each,
      job: newJobId
    }));
    await trx('job_schedule').insert(jobScheduleToBeCloned);

    // create api_config from jobId: api_config
    const apiConfigRes = await trx('api_config').select(
      'job_id', 'method', 'endpoint', 'params', 'headers', 'body', 'last_connected', 'type'
    ).where({ job_id: jobId });
    const apiConfigToBeCloned = apiConfigRes.map(each => ({
      ...each,
      job_id: newJobId
    }));
    await trx('api_config').insert(apiConfigToBeCloned);

    // create social auth for the job: social_auth
    const socialAuthConfigRes = await trx('social_auth').select(
      'job_id', 'type', 'social_name', 'token_type', 'expiry_date', 'scope', 'refresh_token', 'access_token', 'id_token'
    ).where({ job_id: jobId });
    const socialAuthConfigToBeCloned = socialAuthConfigRes.map(each => ({ ...each, user_id: reqPayload?.userId, job_id: newJobId }));
    await trx('social_auth').insert(socialAuthConfigToBeCloned);

    // create source database for the job: source_database
    const databaseConfigRes = await trx('source_database').select(
      'job', 'database_type', 'is_ssl', 'alias_name', 'database_host', 'database_name', 'database_port', 'database_user', 'database_password', 'is_ssh', 'ssh_host', 'ssh_username', 'ssh_password', 'ssh_port', 'ssh_key', 'data_type', 'script', 'tablename', 'enrich_type'
    ).where({ job: jobId });
    const databaseConfigToBeCloned = databaseConfigRes.map(each => ({ ...each, alias_name: `Copy of ${each?.alias_name}`, job: newJobId }));
    await trx('source_database').insert(databaseConfigToBeCloned);

    // create spreadsheet config for the job: spreadsheet_config
    const spreadsheetConfigRes = await trx('spreadsheet_config').select(
      'job_id', 'spreadsheet_id', 'spreadsheet_name', 'sheet', 'sheet_name', 'include_column_header', 'enrich_type', 'range', 'type'
    ).where({ job_id: jobId });
    const spreadsheetConfigToBeCloned = spreadsheetConfigRes.map(each => ({ ...each, user_id: reqPayload?.userId, job_id: newJobId }));
    await trx('spreadsheet_config').insert(spreadsheetConfigToBeCloned);
  })
};
const updateJobDetail = async (jobId: string, reqPayload: any): Promise<Job[]> => {
  return db('job').update(reqPayload)
    .where({ id: jobId })
    .returning('*');
};

const createJobSchedule = async (reqPayload: JobScheduleReqPayloadProps): Promise<JobSchedule[]> => {
  return db('job_schedule').insert(reqPayload).returning('*');
};

const updateJobSchedule = async (jobId: string, reqPayload: any): Promise<JobSchedule[]> => {
  return db('job_schedule').update(reqPayload).where({
    job: jobId
  }).returning('*');
};

const getJobById = async (id: string): Promise<Job[]> => {
  return db('job')
    .select('job.*', 'job_schedule.frequency_name', 'job_schedule.unit', 'job_schedule.value')
    .leftJoin('job_schedule', 'job_schedule.job', 'job.id')
    .where('job.id', '=', id);
};

const deleteJobWithAllRelations = async (jobId: string): Promise<any> => {
  if (!jobId) {
    throw new Error('Job id is required to delete a job');
  }
  await db.transaction(async (trx) => {
    await trx('history.job_history').where('job', jobId).del();
    await trx('history.job_schedule_history').where('job', jobId).del();
    await trx('job_schedule').where('job', jobId).del();
    await trx('source_database').where('job', jobId).del();
    await trx('spreadsheet_config').where('job_id', jobId).del();
    await trx('social_auth').where('job_id', jobId).del();
    await trx('api_config').where('job_id', jobId).del();
    await trx('job').where('id', jobId).del();
  });
};

const getJobByProjectId = async (projectId: string): Promise<Job[]> => {
  return db('job')
    .select('job.*', 'user.email as user_email', 'user.id as user_id', 'job_schedule.frequency_name', 'job_schedule.unit', 'job_schedule.value')
    .leftJoin('user', 'user.id', 'job.created_by')
    .leftJoin('job_schedule', 'job_schedule.job', 'job.id')
    .where({
      project: projectId,
    });
};
const getJobDataSource = async (jobId: string, reqType: 'source' | 'target' | null): Promise<DataSourceTypes[]> => {
  return db('source_database')
    .select()
    .where({
      job: jobId,
      ...(reqType ? { data_type: reqType } : {})
    });
};

const getDataSourceById = async (dataSourceId: string): Promise<DataSourceTypes[]> => {
  return db('source_database')
    .select()
    .where({
      id: dataSourceId,
    });
};

const createJobDataSource = async (reqPayload: Omit<DataSourceTypes, 'created_on' | 'id'>): Promise<DataSourceTypes[]> => {
  return db('source_database').insert(reqPayload).returning('*');
}

const updateJobDataSource = async (dataSourceId: string, reqPayload: Omit<DataSourceTypes, 'created_on' | 'id'>): Promise<DataSourceTypes[]> => {
  return db('source_database')
    .update(reqPayload)
    .where({ id: dataSourceId }).returning('*');
}

const createSpreadSheetConfigForJob = async (reqPayload: SpreadsheetConfig): Promise<SpreadsheetConfig[]> => {
  return db('spreadsheet_config').insert(reqPayload).returning('*');
};

const updateSpreadSheetConfigForJob = async (configId: string, reqPayload: any): Promise<SpreadsheetConfig[]> => {
  return db('spreadsheet_config').update(reqPayload).where({ id: configId }).returning('*');
};

const getSpreadSheetConfigForJob = async (jobId: string, filterObj: { type?: 'source' | 'target' }): Promise<SpreadsheetConfig[]> => {
  if (!jobId) {
    throw new Error('Job id must be defined');
  }
  const filter = {
    job_id: jobId,
    ...filterObj
  }
  return db('spreadsheet_config')
    .select()
    .where(filter);
};


export default {
  getAllJobs, createJob, updateJobDetail, getJobById, deleteJobWithAllRelations, getJobByProjectId, createJobSchedule, updateJobSchedule, createJobDataSource, getJobDataSource, getDataSourceById, updateJobDataSource, createSpreadSheetConfigForJob, updateSpreadSheetConfigForJob, getSpreadSheetConfigForJob, cloneJobByJobId
}