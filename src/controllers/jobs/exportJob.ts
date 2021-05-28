import { zipObject } from 'lodash';
import ClientDBSource from './databaseInstance';
import GoogleSheet from '../googleSheetApi/sheet';
import { Job } from '../../models';

import { getFormattedDataWithHeader, getFormattedDataBody } from '../utils';

class ExportJob {
  jobId: string;
  constructor(jobId) {
    this.jobId = jobId;
  }
  async getSpreadSheetConfigForJob(type: 'source' | 'target') {
    if (!type) {
      throw new Error('Rquest type must be provided');
    }
    const [sheetData] = await Job.getSpreadSheetConfigForJob(this.jobId, { type });
    return sheetData;
  }

  async getDataFromSheet(type): Promise<any[]> {
    const sheetApi = await GoogleSheet.init(this.jobId, type);
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

    /**
     * Database to others
     */
    // 1. Database to Spreadsheet
    if (source === 'database' && target === 'spreadsheet') {
      await this._exportFromDBToSpreadSheet();
      return;
    }

    // 2. Database to Database
    if (source === 'database' && target === 'database') {
      await this._exportFromDatabaseToDatabase();
      return;
    }
    /**
     * Spreadsheet to others
     */

    // 1. Spreadsheet to Database
    if (source === 'spreadsheet' && target === 'database') {
      await this._exportFromSpreadSheetToDatabase();
      return;
    }

    // 2. Spreadsheet to Spreadsheet
    if (source === 'spreadsheet' && target === 'spreadsheet') {
      await this._exportFromSpreadSheetToSpreadSheet();
      return;
    }

  }

  async _exportFromSpreadSheetToSpreadSheet() {
    /* Get rows from sheet */
    const sheetData: any[] = await this.getDataFromSheet('source');

    if (!sheetData.length) {
      throw new Error('Source sheet is empty.');
    }

    /* Get target sheet config */
    const reqType = 'target';
    const sheetApi = await GoogleSheet.init(this.jobId, reqType);

    const targetSheetConfig = await this.getSpreadSheetConfigForJob(reqType);
    const spreadsheetId = targetSheetConfig?.spreadsheet_id;
    const sheetId = targetSheetConfig?.sheet;
    const isIncludeHeader = targetSheetConfig?.include_column_header ?? false;
    const appendDataRange = `${targetSheetConfig?.sheet_name}!${targetSheetConfig?.range}`;

    /* Clear target sheet if needed */
    if (targetSheetConfig?.enrich_type === 'replace') {
      // Clear sheet completely if enrich_type is replace
      await sheetApi.clearRowsInSheet(
        spreadsheetId,
        sheetId,
        true
      );
      console.info('Sheet cleared for: ', targetSheetConfig?.sheet_name);
    }

    /*  */
    const formattedData = isIncludeHeader ? sheetData : sheetData.slice(1)

    /* Export to sheet */
    await sheetApi.appendDataToSheet(spreadsheetId, appendDataRange, formattedData);

    console.info('Export complete');
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
    if (!formattedRows.length) {
      throw new Error('Source sheet is empty.');
    }

    /* insert data into table */
    await db.transaction(async (trx) => {
      if (config.enrich_type === 'replace') {
        await trx(tableName).del();
      }
      await trx(tableName).insert(formattedRows);
    });
    console.log(`Data ${config.enrich_type === 'replace' ? 'replaced' : 'appended'} with ${formattedRows.length} records to table ${tableName}`);
  }

  async _exportFromDatabaseToDatabase() {
    /* Run script to get data from DB */
    const { db: sourceDB, config: sourceConfig } = await ClientDBSource.init(this.jobId, 'source');
    const dbResponse = await sourceDB.raw(`${sourceConfig.script}`);
    const dataToExport = dbResponse?.rows;
    if (!dataToExport?.length) {
      throw new Error('No data to export!');
    }

    /* insert data into table */
    const { db: targetDB, config: targetDBConfig } = await ClientDBSource.init(this.jobId, 'target');
    const tableName = targetDBConfig.tablename;
    await targetDB.transaction(async (trx) => {
      if (targetDBConfig.enrich_type === 'replace') {
        await trx(tableName).del();
      }
      await trx(tableName).insert(dataToExport);
    });
    console.log(`Data ${targetDBConfig.enrich_type === 'replace' ? 'replaced' : 'appended'} with ${dataToExport.length} records to table ${tableName}`);
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
    const targetType = 'target';
    const sheetApi = await GoogleSheet.init(this.jobId, targetType);

    const sheetData = await this.getSpreadSheetConfigForJob(targetType);
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