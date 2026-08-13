const express = require('express');
const router = express.Router();
const {
  getStudentReport,
  getAttendanceReport,
  getFeeReport,
  getResultReport,
  getBatchReport
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(authorize('ADMIN', 'TRAINER'));

router.get('/students', getStudentReport);
router.get('/attendance', getAttendanceReport);
router.get('/fees', getFeeReport);
router.get('/results', getResultReport);
router.get('/batches', getBatchReport);

module.exports = router;
