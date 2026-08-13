const express = require('express');
const router = express.Router();
const {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent
} = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.route('/')
  .post(authorize('ADMIN'), createStudent)
  .get(authorize('ADMIN', 'TRAINER'), getStudents);

router.route('/:id')
  .get(authorize('ADMIN', 'TRAINER', 'STUDENT'), getStudentById)
  .put(authorize('ADMIN'), updateStudent)
  .delete(authorize('ADMIN'), deleteStudent);

module.exports = router;
