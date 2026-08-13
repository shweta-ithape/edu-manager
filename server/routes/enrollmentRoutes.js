const express = require('express');
const router = express.Router();
const {
  createEnrollment,
  getEnrollments,
  updateEnrollmentStatus,
  deleteEnrollment
} = require('../controllers/enrollmentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.route('/')
  .post(authorize('ADMIN'), createEnrollment)
  .get(getEnrollments);

router.route('/:id')
  .put(authorize('ADMIN'), updateEnrollmentStatus)
  .delete(authorize('ADMIN'), deleteEnrollment);

module.exports = router;
