import knex from 'knex';
import { Job } from '../../models';
import db from '../../models/db';
import ExportJob from './exportJob';
import { Job as JobTypes, CreateJobPayload, DataSource } from 'src/types';

const createJob = async (req, res, next) => {
  try {
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
    next(e);
  }
};

const cloneJobById = async (req, res, next) => {
  try {
    const { id: jobId } = req.params;
    const { id: userId } = req.locals?.user;

    if (!jobId) {
      throw new Error('Job id is required!');
    }
    // Clone job
    await Job.cloneJobByJobId(jobId, { userId });
    res.status(200).json({ data: 'Job cloned successfully!' });
  } catch (e) {
    next(e);
  }
}
const getAllJobs = async (req, res, next) => {
  try {
    const { account_id } = req.headers;

    if (!account_id) {
      throw new Error('Account id is required!');
    }
    const jobs: JobTypes[] = await Job.getAllJobs();
    res.status(200).json(jobs);
  } catch (e) {
    next(e);
  }
};

const getJobById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new Error('Job id is required!');
    }
    const job: JobTypes[] = await Job.getJobById(id);
    res.status(200).json(job);
  } catch (e) {
    next(e);
  }
};

const deleteJobById = async (req, res, next) => {
  try {
    const { id: jobId } = req.params;

    const [job] = await Job.getJobById(jobId);
    if (!job) {
      throw new Error('Job does not exist!')
    }
    await Job.deleteJobWithAllRelations(jobId);

    /*
     * Feature addition in future
     * Send email notification to all members of the job
     */

    res.status(200).json([]);
  } catch (e) {
    next(e);
  }
};

const updateJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const reqPayload = req.body;
    const dataSourceCompletedState = reqPayload?.is_data_source_configured ? { is_data_source_configured: true } : {}
    const dataTargetCompletedState = reqPayload?.is_data_target_configured ? { is_data_target_configured: true } : {}

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
      data_source: reqPayload.data_source || '',
      data_target: reqPayload.data_target || '',
      ...dataSourceCompletedState,
      ...dataTargetCompletedState
    }

    const [job]: JobTypes[] = await Job.getJobById(id);
    const isSourceOrTargetChanged = job?.data_source !== updateJobPayload?.data_source || job?.data_target !== updateJobPayload?.data_target;

    if (!isSourceOrTargetChanged) {
      await Job.updateJobDetail(id, updateJobPayload);
      res.status(200).json('job');
      return;
    }

    let sourceOrTargetStatus = {};
    await db.transaction(async (trx) => {
      if (job?.data_source !== updateJobPayload?.data_source) {
        sourceOrTargetStatus = {
          ...sourceOrTargetStatus,
          is_data_source_configured: false
        };
        // delete data source
        switch (job?.data_source) {
          case 'api':
            await Job.deleteApiConfigForJob(id, 'source', trx);
            break;
          case 'database':
            await Job.deleteDatabaseConfigForJob(id, 'source', trx);
            break;
          case 'spreadsheet':
            await Job.deleteSpreadsheetConfigForJob(id, 'source', trx);
            break;
          default:
            throw new Error('Data source invalid!')

        }
      }
      if (job?.data_target !== updateJobPayload?.data_target) {
        sourceOrTargetStatus = {
          ...sourceOrTargetStatus,
          is_data_target_configured: false
        };
        // delete data target
        switch (job?.data_target) {
          case 'api':
            await Job.deleteApiConfigForJob(id, 'target', trx);
            break;
          case 'database':
            await Job.deleteDatabaseConfigForJob(id, 'target', trx);
            break;
          case 'spreadsheet':
            await Job.deleteSpreadsheetConfigForJob(id, 'target', trx);
            break;
          default:
            throw new Error('Data target invalid!')
        }
      }
      await Job.updateJobDetail(id, { ...updateJobPayload, ...sourceOrTargetStatus }, trx);
    });
    res.status(200).json('job');
  } catch (e) {
    next(e);
  }
};

const getJobByProjectId = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new Error('Project id is required!');
    }
    const jobs: JobTypes[] = await Job.getJobByProjectId(id);
    res.status(200).json(jobs);
  } catch (e) {
    next(e);
  }
};

const createDataSource = async (req, res, next) => {
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
    next(e);
  }
}


const updateDataSource = async (req, res, next) => {
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
      script: reqPayload?.script ?? '',
      tablename: reqPayload?.tablename ?? '',
      enrich_type: reqPayload?.enrich_type ?? ''
    }
    const dataSource: DataSource[] = await Job.updateJobDataSource(dataSourceId, dataSourcePayload);
    res.status(200).json(dataSource);
  } catch (e) {
    next(e);
  }
}

const getJobDataSource = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new Error('Job id is required!');
    }
    const jobDataSource: DataSource[] = await Job.getJobDataSource(id, null);
    res.status(200).json(jobDataSource);
  } catch (e) {
    next(e);
  }
}

const getDataSourceByDatasourceId = async (req, res, next) => {
  try {
    const { data_source_id } = req.params;
    if (!data_source_id) {
      throw new Error('Data source id is required!');
    }
    const jobDataSource: DataSource[] = await Job.getDataSourceById(data_source_id);
    res.status(200).json(jobDataSource);
  } catch (e) {
    next(e);
  }
}

const checkDatabaseConnectionByJobId = async (req, res, next) => {
  try {
    const { data_source_id } = req.params;
    if (!data_source_id) {
      throw new Error('Data source id is required!');
    }
    const [jobDataSource]: DataSource[] = await Job.getDataSourceById(data_source_id);
    /* Connect to db */
    let dbInstance;
    try {
      dbInstance = await knex({
        client: jobDataSource?.database_type?.toLowerCase(),
        connection: {
          host: jobDataSource?.database_host,
          port: +jobDataSource?.database_port,
          user: jobDataSource?.database_user,
          password: jobDataSource?.database_password,
          database: jobDataSource?.database_name,
        }
      });
      await dbInstance.raw(`SELECT 1`);
      res.status(200).json({ data: 'connected successfully!' });
    } finally {
      if (dbInstance) {
        await dbInstance.destroy();
      }
    }
  } catch (e) {
    next(e);
  }
}

const listAllDatabaseTable = async (req, res, next) => {
  try {
    const { data_source_id } = req.params;
    if (!data_source_id) {
      throw new Error('Data source id is required!');
    }
    const [jobDataSource]: DataSource[] = await Job.getDataSourceById(data_source_id);
    /* Connect to db */
    let dbInstance;
    let databaseTable: any = [];
    try {
      const databaseClient = jobDataSource?.database_type?.toLowerCase();
      dbInstance = await knex({
        client: databaseClient,
        connection: {
          host: jobDataSource?.database_host,
          port: +jobDataSource?.database_port,
          user: jobDataSource?.database_user,
          password: jobDataSource?.database_password,
          database: jobDataSource?.database_name
        }
      });
      switch (databaseClient) {
        case 'postgresql':
          databaseTable = await dbInstance.raw(`
            SELECT
              table_schema||'.'||table_name AS tablename
            FROM information_schema.tables
            WHERE table_type ='BASE TABLE'
              AND table_schema not in ('pg_catalog', 'information_schema')
              AND table_schema = '${jobDataSource?.database_name}'
            ORDER BY table_schema;
          `);
          break;
        case 'mysql':
          const [tableData] = await dbInstance.raw(`
            SELECT 
              table_name AS tablename 
            FROM information_schema.tables
            WHERE table_type ='BASE TABLE'
              AND table_schema not in ('information_schema')
              AND table_schema = '${jobDataSource?.database_name}'
            ORDER BY table_schema;
          `);
          databaseTable = {
            rows: tableData
          }
          break;
        default:
          databaseTable = databaseTable;
      }
      console.log('databaseTable ', JSON.stringify(databaseTable))
    } finally {
      if (dbInstance) {
        await dbInstance.destroy();
      }
    }
    res.status(200).json(databaseTable?.rows ?? []);
  } catch (e) {
    next(e);
  }
}
const createSpreadSheetConfigForJob = async (req, res, next) => {
  try {
    type reqPayloadTypes = {
      include_column_header: boolean;
      enrich_type: 'append' | 'replace';
      range: string;
      sheet: string;
      spreadsheet_id: string;
      spreadsheet_name: string;
      type: 'source' | 'target';
    }
    const { id: userId } = req.locals?.user;
    const { id: jobId } = req.params;
    const reqPayload: reqPayloadTypes = req.body;

    if (!userId) {
      throw new Error('User must be logged in!');
    }

    const spreadsheetConfig = await Job.createSpreadSheetConfigForJob({
      ...reqPayload,
      user_id: userId,
      job_id: jobId,
    });

    /* Update job */
    await Job.updateJobDetail(jobId, {
      [`is_data_${reqPayload.type}_configured`]: true
    });
    res.status(200).json(spreadsheetConfig);
  } catch (e) {
    next(e);
  }
}

const getSpreadSheetConfigForJob = async (req, res, next) => {
  try {
    const { id: userId } = req.locals?.user;
    const { id: jobId } = req.params;
    const { type: requestType }: { type: 'source' | 'target' | 'undefined' } = req.query;

    if (!userId) {
      throw new Error('User must be logged in!');
    }

    const spreadsheetConfig = await Job.getSpreadSheetConfigForJob(
      jobId,
      requestType && requestType !== 'undefined' ? { type: requestType } : {}
    );
    res.status(200).json(spreadsheetConfig);
  } catch (e) {
    next(e);
  }
}

const updateSpreadSheetConfigForJob = async (req, res, next) => {
  try {
    type reqPayloadTypes = {
      include_column_header?: boolean;
      enrich_type?: 'append' | 'replace';
      range?: string;
      sheet?: string;
      spreadsheet_id?: string;
      spreadsheet_name?: string;
      type?: 'source' | 'target';
    }
    const { id: userId } = req.locals?.user;
    const { id: jobId, config_id: configId
    } = req.params;
    const reqPayload: reqPayloadTypes = req.body;

    if (!userId) {
      throw new Error('User must be logged in!');
    }

    const spreadsheetConfig = await Job.updateSpreadSheetConfigForJob(configId, reqPayload);
    res.status(200).json(spreadsheetConfig);
  } catch (e) {
    next(e);
  }
}

const exportJobFromDatabaseToSpreadsheet = async (req, res, next) => {
  try {
    const { id: jobId } = req.params;
    const type = req?.body?.type ?? 'target';
    const { id: userId } = req.locals?.user;
    if (!userId) {
      throw new Error('User must be logged in!');
    }

    const exportJob = new ExportJob(jobId);
    await exportJob.handleExport();

    res.status(200).json({ data: 'Data exported to sheet successfully!' });
  } catch (e) {
    next(e);
  }
}

export {
  getJobById, getJobByProjectId, createJob, cloneJobById, updateJob, deleteJobById, createDataSource, getJobDataSource, getDataSourceByDatasourceId, updateDataSource, checkDatabaseConnectionByJobId, listAllDatabaseTable, createSpreadSheetConfigForJob, getSpreadSheetConfigForJob, updateSpreadSheetConfigForJob, exportJobFromDatabaseToSpreadsheet,
}
