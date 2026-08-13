const express = require('express');
const router = express.Router();
const {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse
} = require('../controllers/courseController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.route('/')
  .post(authorize('ADMIN'), createCourse)
  .get(getCourses);

router.route('/:id')
  .get(getCourseById)
  .put(authorize('ADMIN'), updateCourse)
  .delete(authorize('ADMIN'), deleteCourse);

module.exports = router;
