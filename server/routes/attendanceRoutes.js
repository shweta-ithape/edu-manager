const express = require('express');
const router = express.Router();
const {
  markAttendance,
  getAttendance,
  getBatchAttendanceSummary
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.post('/', authorize('ADMIN', 'TRAINER'), markAttendance);
router.get('/', getAttendance);
router.get('/batch-summary/:batchId', authorize('ADMIN', 'TRAINER'), getBatchAttendanceSummary);

module.exports = router;
