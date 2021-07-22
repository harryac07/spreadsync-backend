import express from 'express';
import { checkAuth } from '../../middleware';
import { jobController, jobApiConfigController } from '../../controllers';

const router = express.Router();

router.post('/', checkAuth, jobController.createJob);
router.get('/project/:id', checkAuth, jobController.getJobByProjectId);
router.get('/:id', checkAuth, jobController.getJobById);
router.post('/:id/clone', checkAuth, jobController.cloneJobById);
router.patch('/:id', checkAuth, jobController.updateJob);
router.delete('/:id', checkAuth, jobController.deleteJobById);
router.get('/:id/datasource', checkAuth, jobController.getJobDataSource);
router.post('/:id/datasource', checkAuth, jobController.createDataSource);
router.post('/:id/sheets/config', checkAuth, jobController.createSpreadSheetConfigForJob);
router.get('/:id/sheets/config', checkAuth, jobController.getSpreadSheetConfigForJob);
router.patch('/:id/sheets/config/:config_id', checkAuth, jobController.updateSpreadSheetConfigForJob);
router.patch('/:id/datasource/:data_source_id', checkAuth, jobController.updateDataSource);
router.get('/:id/datasource/:data_source_id', checkAuth, jobController.getDataSourceByDatasourceId);
router.post('/:id/datasource/:data_source_id/connection-check', checkAuth, jobController.checkDatabaseConnectionByJobId);
router.get('/:id/datasource/:data_source_id/list-table', checkAuth, jobController.listAllDatabaseTable);
// API data source
router.get('/:id/apiconfig/:apiconfig_id/connection-check', checkAuth, jobApiConfigController.checkApiConnection);
router.post('/:id/apiconfig/', checkAuth, jobApiConfigController.createApiConfig);
router.get('/:id/apiconfig/', checkAuth, jobApiConfigController.getApiConfigByJobId);
router.patch('/:id/apiconfig/:apiconfig_id', checkAuth, jobApiConfigController.updateAPIConfig);
// Export job
router.post('/:id/export', checkAuth, jobController.exportJobFromDatabaseToSpreadsheet);
export {
  router
};
