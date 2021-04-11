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

const getJobByProjectId = async (projectId: string): Promise<Job[]> => {
  return db('job')
    .select('job.*', 'user.email as user_email', 'user.id as user_id', 'job_schedule.frequency_name', 'job_schedule.unit', 'job_schedule.value')
    .leftJoin('user', 'user.id', 'job.created_by')
    .leftJoin('job_schedule', 'job_schedule.job', 'job.id')
    .where({
      project: projectId,
    });
};
const getJobDataSource = async (jobId: string): Promise<DataSourceTypes[]> => {
  const [jobData] = await getJobById(jobId);
  if (jobData?.id) {
    const dataSource = jobData?.data_source ?? ''
    switch (dataSource) {
      case 'database':
      default:
        return db('source_database')
          .select()
          .where({
            job: jobId,
          });
    }
  } else {
    throw new Error('No jobId found!')
  }
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


export default { getAllJobs, createJob, updateJobDetail, getJobById, getJobByProjectId, createJobSchedule, updateJobSchedule, createJobDataSource, getJobDataSource, updateJobDataSource, createSpreadSheetConfigForJob, updateSpreadSheetConfigForJob, getSpreadSheetConfigForJob }