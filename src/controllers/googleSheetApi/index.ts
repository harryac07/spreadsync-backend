import GoogleApi from '../../util/googleAuth';
import GoogleSheet from './sheet';

type DataJobType = 'source' | 'target';

const createNewSpreadSheet = async (req, res, next) => {
  try {
    const { id: userId } = req.locals?.user ?? {};
    const { job_id: jobId } = req.params;
    if (!userId) {
      throw new Error('User not authenticated!');
    }
    const { spreadsheet_name = '', type } = req.body;
    if (!spreadsheet_name) {
      throw new Error('Spreadsheet name is required!');
    }
    const googleClient = await GoogleApi.initForJob(jobId, type);
    const sheetApi = new GoogleSheet(googleClient.oAuth2Client);
    const spreadsheetId: string = await sheetApi.createSpreadsheet(spreadsheet_name);
    res.status(200).json({
      spreadsheet_id: spreadsheetId
    });
  } catch (error) {
    next(error);
  }
}

const listAllGoogleSheetsForJob = async (req, res, next) => {
  try {
    const { id: userId } = req.locals?.user ?? {};
    const { job_id: jobId } = req.params;
    const { nextPageToken, reqType } = req.query;
    if (!userId) {
      throw new Error('User not authenticated!');
    }

    let sheetList: any = { files: [] };
    try {
      const googleClient = await GoogleApi.initForJob(jobId, reqType);
      const sheetApi = new GoogleSheet(googleClient.oAuth2Client);
      sheetList = await sheetApi.listAllSpreadSheetsFromDrive(nextPageToken);
    } finally {
      res.status(200).json({
        ...sheetList,
        type: reqType
      });
    }
    return;
  } catch (error) {
    next(error);
  }
}

const getSpreadSheet = async (req, res, next) => {
  try {
    const { id: userId } = req.locals?.user ?? {};
    const { id: spreadSheetId, job_id: jobId } = req.params;
    const { data_type: dataType }: { data_type: DataJobType } = req.query;

    if (!userId) {
      throw new Error('User not authenticated!');
    }
    const googleClient = await GoogleApi.initForJob(jobId, dataType);
    const sheetApi = new GoogleSheet(googleClient.oAuth2Client);
    const spreadSheet = await sheetApi.getSpreadSheet(spreadSheetId);
    res.status(200).json(spreadSheet);
  } catch (error) {
    next(error);
  }
}

export {
  createNewSpreadSheet,
  listAllGoogleSheetsForJob,
  getSpreadSheet
}