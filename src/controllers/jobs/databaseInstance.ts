import knex from 'knex';
import { Job } from '../../models';


type ReqType = 'target' | 'source';

class DatabaseSource {
  db: any;
  jobId: string;
  dbConfig: any;
  constructor(jobId: string) {
    this.db = null;
    this.dbConfig = null;
    this.jobId = jobId;
  }
  /**
 * init - Init method
 * @param {String} jobId - job id
 */
  static init(jobId: string, type: ReqType) {
    return (async function () {
      let dbSource = new DatabaseSource(jobId)
      await dbSource.initialiseDatabase(type);
      return {
        db: dbSource.db,
        config: dbSource.dbConfig
      };
    }())
  }

  async initialiseDatabase(type: ReqType): Promise<void> {
    const [dataSource] = await Job.getJobDataSource(this.jobId, type);
    if (!dataSource) {
      throw new Error('Datasource not found with jobId!');
    }
    this.db = knex({
      client: dataSource?.database_type?.toLowerCase(),
      connection: {
        host: dataSource?.database_host,
        port: +dataSource?.database_port,
        user: dataSource?.database_user,
        password: dataSource?.database_password,
        database: dataSource?.database_name
      }
    });
    this.dbConfig = dataSource;
  }
}

export default DatabaseSource;
