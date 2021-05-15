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

  // async getDataFromSheet() {
  //   const googleClient = await GoogleApi.initForJob(this.jobId);
  //   const sheetApi = new GoogleSheet(googleClient.oAuth2Client);

  //   const [sheetData] = await Job.getSpreadSheetConfigForJob(this.jobId, { type });
  // }

  // async getDataFromDatabase() {
  //   const db = await ClientDBSource.init(this.jobId);

  // }

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
      console.log('yet to build')
      return;
    }

  }

  async _exportFromDBToSpreadSheet() {

    /* Get job */
    const job = await this.getJobById();

    /* Run script to get data from DB */
    const db = await ClientDBSource.init(this.jobId);
    const dbResponse = await db.raw(`${job?.script}`);
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