import knex from 'knex';
import { Job } from '../../models';

class DatabaseSource {
  db: any;
  jobId: string;
  constructor(jobId: string) {
    this.db = null;
    this.jobId = jobId;
  }
  /**
 * init - Init method
 * @param {String} jobId - job id
 */
  static init(jobId: string) {
    return (async function () {
      let dbSource = new DatabaseSource(jobId)
      await dbSource.initialiseDatabase();
      return dbSource.db;
    }())
  }

  async initialiseDatabase(): Promise<void> {
    const [dataSource] = await Job.getJobDataSource(this.jobId);
    if (!dataSource) {
      throw new Error('Datasource not found with jobId!');
    }
    this.db = knex({
      client: dataSource?.database_type?.toLowerCase(),
      connection: {
        host: dataSource?.database_host,
        user: dataSource?.database_user,
        password: dataSource?.database_password,
        database: dataSource?.database_name
      }
    });
  }
}

export default DatabaseSource;
