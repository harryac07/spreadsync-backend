import { zipObject } from 'lodash';
import ClientDBSource from './databaseInstance';
import GoogleApi from '../../util/googleAuth';
import GoogleSheet from '../googleSheetApi/sheet';
import { Job } from '../../models';

import { getFormattedDataWithHeader, getFormattedDataBody } from '../utils';

class ExportJob {
  jobId: string;
  constructor(jobId) {
    this.jobId = jobId;
  }
  async getSpreadSheetConfigForJob(type: 'source' | 'target' = "source") {
    const [sheetData] = await Job.getSpreadSheetConfigForJob(this.jobId, { type });
    return sheetData;
  }

  async getDataFromSheet(type): Promise<any[]> {
    const googleClient = await GoogleApi.initForJob(this.jobId);
    const sheetApi = new GoogleSheet(googleClient.oAuth2Client);

    const config = await this.getSpreadSheetConfigForJob(type);
    const sheetRange = `${config?.sheet_name}`;
    const sheetRowsResponse = await sheetApi.getValuesFromSheet(config.spreadsheet_id, sheetRange) as any;
    return sheetRowsResponse;
  }

  async getJobById() {
    const [job] = await Job.getJobById(this.jobId);
    return job;
  }

  async handleExport() {
    const job = await this.getJobById();
    const source = job.data_source;
    const target = job.data_target;

    /* Database to others */
    if (source === 'database' && target === 'spreadsheet') {
      await this._exportFromDBToSpreadSheet();
      return;
    }

    /* Spreadsheet to others */
    if (source === 'spreadsheet' && target === 'database') {
      await this._exportFromSpreadSheetToDatabase();
      return;
    }

  }

  async _exportFromSpreadSheetToDatabase() {
    /* Check if target db table is configured */
    const { db, config } = await ClientDBSource.init(this.jobId, 'target');
    const tableName = config.tablename;
    if (!tableName) {
      throw new Error('Table name is not set!');
    }
    /* Get rows from sheet */
    const sheetData: any[] = await this.getDataFromSheet('source');

    /* Format sheetData */
    /* For now assume sheet has header */
    const [header, ...sheetRows] = sheetData;
    const formattedRows = sheetRows.map(each => {
      return zipObject(header, each);
    });

    /* insert data into table */
    await db.transaction(async (trx) => {
      if (config.enrich_type === 'replace') {
        await trx(tableName).del();
      }
      await trx(tableName).insert(formattedRows);
    });
    console.log(`Data ${config.enrich_type === 'replace' ? 'replaced' : 'appended'} with ${formattedRows.length} records to table ${tableName}`);
  }

  async _exportFromDBToSpreadSheet() {

    /* Run script to get data from DB */
    const { db, config } = await ClientDBSource.init(this.jobId, 'source');
    const dbResponse = await db.raw(`${config.script}`);
    const dataRows = dbResponse?.rows;
    if (!dataRows?.length) {
      throw new Error('No data to export!');
    }

    /* Get sheet config */
    const googleClient = await GoogleApi.initForJob(this.jobId);
    const sheetApi = new GoogleSheet(googleClient.oAuth2Client);

    const sheetData = await this.getSpreadSheetConfigForJob('target');
    const spreadsheetId = sheetData?.spreadsheet_id;
    const sheetId = sheetData?.sheet;
    const isIncludeHeader = sheetData?.include_column_header ?? false;
    const appendDataRange = `${sheetData?.sheet_name}!${sheetData?.range}`;

    /* Clear sheet if needed */
    if (sheetData?.enrich_type === 'replace') {
      // Clear sheet completely if enrich_type is replace
      await sheetApi.clearRowsInSheet(
        spreadsheetId,
        sheetId,
        true
      );
      console.info('Sheet cleared for ', sheetData?.sheet_name);
    }

    /* format data for sheet */
    const formattedDataToInsert: any[] = isIncludeHeader
      ? getFormattedDataWithHeader(dataRows)
      : getFormattedDataBody(dataRows)

    /* Export to sheet */
    await sheetApi.appendDataToSheet(spreadsheetId, appendDataRange, formattedDataToInsert);

    console.info('Export complete');
  }
}

export default ExportJob;