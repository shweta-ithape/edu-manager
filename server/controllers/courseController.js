const Course = require('../models/Course');
const Batch = require('../models/Batch');

// @desc    Create a new course
// @route   POST /api/courses
// @access  Admin
const createCourse = async (req, res, next) => {
  try {
    const { courseName, description, duration, totalFees, status } = req.body;

    if (!courseName || !duration || totalFees === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Course Name, Duration, and Total Fees are required'
      });
    }

    const existingCourse = await Course.findOne({
      courseName: courseName.trim()
    });

    if (existingCourse) {
      return res.status(409).json({
        success: false,
        message: 'Course with this name already exists'
      });
    }

    if (totalFees < 0) {
      return res.status(400).json({
        success: false,
        message: 'Total Fees cannot be negative'
      });
    }


    const course = await Course.create({
      courseName: courseName.trim(),
      description,
      duration,
      totalFees: Number(totalFees),
      status: status || 'ACTIVE'
    });

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all courses
// @route   GET /api/courses
// @access  All authenticated users
const getCourses = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const query = {};

    if (status) query.status = status;
    if (search) {
      query.$or = [
        { courseName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const courses = await Course.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  All authenticated users
const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Admin
const updateCourse = async (req, res, next) => {
  try {
    let course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const { courseName, description, duration, totalFees, status } = req.body;

    if (totalFees !== undefined && totalFees < 0) {
      return res.status(400).json({ success: false, message: 'Total Fees cannot be negative' });
    }

    course.courseName = courseName || course.courseName;
    course.description = description !== undefined ? description : course.description;
    course.duration = duration || course.duration;
    course.totalFees = totalFees !== undefined ? Number(totalFees) : course.totalFees;
    course.status = status || course.status;

    await course.save();

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: course
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Admin
const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const linkedBatches = await Batch.countDocuments({ course: course._id });
    if (linkedBatches > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete course. It is assigned to ${linkedBatches} batch(es). Deactivate the course instead.`
      });
    }

    await course.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse
};
