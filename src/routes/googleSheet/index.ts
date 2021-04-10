import express from 'express';
import { checkAuth } from '../../middleware';
import { googleSheetController } from '../../controllers';

const router = express.Router();

router.get('/list/job/:job_id', checkAuth, googleSheetController.listAllGoogleSheetsForJob);
router.get('/:id/job/:job_id', checkAuth, googleSheetController.getSpreadSheet);
export {
  router
};
