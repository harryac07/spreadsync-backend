import GoogleApi from '../../util/googleAuth';
import GoogleSheet from './sheet';

type DataJobType = 'source' | 'target';

const listAllGoogleSheetsForJob = async (req, res) => {
  try {
    const { id: userId } = req.locals?.user ?? {};
    const { job_id: jobId, nextPageToken } = req.params;
    if (!userId) {
      throw new Error('User not authenticated!');
    }
    const googleClient = await GoogleApi.initForJob(jobId);
    const sheetApi = new GoogleSheet(googleClient.oAuth2Client);
    const sheetList = await sheetApi.listAllSpreadSheetsFromDrive(nextPageToken);
    res.status(200).json(sheetList);
  } catch (error) {
    console.error(error.stack);
    res.status(500).json({
      message: error.message || 'Invalid Request',
    });
  }
}

const getSpreadSheet = async (req, res) => {
  try {
    const { id: userId } = req.locals?.user ?? {};
    const { id: spreadSheetId, job_id: jobId } = req.params;
    const { data_type: dataType }: { data_type: DataJobType } = req.query; // will be handled later when sheet => sheet sync is supported

    if (!userId) {
      throw new Error('User not authenticated!');
    }
    const googleClient = await GoogleApi.initForJob(jobId);
    const sheetApi = new GoogleSheet(googleClient.oAuth2Client);
    const spreadSheet = await sheetApi.getSpreadSheet(spreadSheetId);
    res.status(200).json(spreadSheet);
  } catch (error) {
    console.error(error.stack);
    res.status(500).json({
      message: error.message || 'Invalid Request',
    });
  }
}

export {
  listAllGoogleSheetsForJob,
  getSpreadSheet
}