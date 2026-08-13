const Batch = require('../models/Batch');
const Course = require('../models/Course');
const Trainer = require('../models/Trainer');
const Enrollment = require('../models/Enrollment');

// @desc    Create a new batch
// @route   POST /api/batches
// @access  Admin
const createBatch = async (req, res, next) => {
  try {
    const { batchName, courseId, trainerId, startDate, endDate, timing, capacity, status } = req.body;

    if (!batchName || !courseId || !trainerId || !startDate || !endDate || !timing || capacity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'All fields (batchName, courseId, trainerId, startDate, endDate, timing, capacity) are required'
      });
    }

    // Capacity check
    if (Number(capacity) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Batch capacity must be a positive number'
      });
    }

    // Date check: End date cannot be before start date
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid start date or end date format'
      });
    }

    if (end < start) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot be before start date'
      });
    }

    // Validate Course existence
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Selected course does not exist' });
    }

    // Validate Trainer existence and ACTIVE status
    const trainer = await Trainer.findById(trainerId);
    if (!trainer) {
      return res.status(404).json({ success: false, message: 'Selected trainer does not exist' });
    }

    if (trainer.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        message: `Trainer '${trainer.name}' is inactive. Only active trainers can be assigned to batches.`
      });
    }

    const batch = await Batch.create({
      batchName: batchName.trim(),
      course: course._id,
      trainer: trainer._id,
      startDate: start,
      endDate: end,
      timing,
      capacity: Number(capacity),
      status: status || 'ACTIVE'
    });

    const populatedBatch = await Batch.findById(batch._id)
      .populate('course', 'courseName totalFees duration')
      .populate('trainer', 'trainerId name email specialization');

    res.status(201).json({
      success: true,
      message: 'Batch created successfully',
      data: populatedBatch
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all batches
// @route   GET /api/batches
// @access  Authenticated users
const getBatches = async (req, res, next) => {
  try {
    const { courseId, trainerId, status, search } = req.query;
    const query = {};

    if (status) query.status = status;
    if (courseId) query.course = courseId;
    if (trainerId) query.trainer = trainerId;

    // If logged-in user is a TRAINER, allow viewing assigned batches by default
    if (req.user.role === 'TRAINER') {
      const trainer = await Trainer.findOne({ user: req.user.id });
      if (trainer && !trainerId) {
        query.trainer = trainer._id;
      }
    }

    if (search) {
      query.batchName = { $regex: search, $options: 'i' };
    }

    const batches = await Batch.find(query)
      .sort({ createdAt: -1 })
      .populate('course', 'courseName totalFees duration')
      .populate('trainer', 'trainerId name email specialization');

    // Attach enrolled student count for each batch
    const batchesWithCount = await Promise.all(
      batches.map(async (b) => {
        const enrolledCount = await Enrollment.countDocuments({
          batch: b._id,
          status: 'ENROLLED'
        });
        return {
          ...b.toObject(),
          enrolledCount
        };
      })
    );

    res.status(200).json({
      success: true,
      count: batchesWithCount.length,
      data: batchesWithCount
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single batch
// @route   GET /api/batches/:id
// @access  Authenticated users
const getBatchById = async (req, res, next) => {
  try {
    const batch = await Batch.findById(req.params.id)
      .populate('course', 'courseName totalFees duration description')
      .populate('trainer', 'trainerId name email specialization phone');

    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }

    const enrolledCount = await Enrollment.countDocuments({
      batch: batch._id,
      status: 'ENROLLED'
    });

    res.status(200).json({
      success: true,
      data: {
        ...batch.toObject(),
        enrolledCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update batch
// @route   PUT /api/batches/:id
// @access  Admin
const updateBatch = async (req, res, next) => {
  try {
    let batch = await Batch.findById(req.params.id);
    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }

    const { batchName, courseId, trainerId, startDate, endDate, timing, capacity, status } = req.body;

    if (capacity !== undefined && Number(capacity) <= 0) {
      return res.status(400).json({ success: false, message: 'Batch capacity must be a positive number' });
    }

    const newStart = startDate ? new Date(startDate) : batch.startDate;
    const newEnd = endDate ? new Date(endDate) : batch.endDate;

    if (newEnd < newStart) {
      return res.status(400).json({ success: false, message: 'End date cannot be before start date' });
    }

    if (trainerId && trainerId !== batch.trainer.toString()) {
      const trainer = await Trainer.findById(trainerId);
      if (!trainer) {
        return res.status(404).json({ success: false, message: 'Selected trainer does not exist' });
      }
      if (trainer.status !== 'ACTIVE') {
        return res.status(400).json({ success: false, message: `Trainer '${trainer.name}' is inactive` });
      }
      batch.trainer = trainer._id;
    }

    if (courseId && courseId !== batch.course.toString()) {
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ success: false, message: 'Selected course does not exist' });
      }
      batch.course = course._id;
    }

    batch.batchName = batchName || batch.batchName;
    batch.startDate = newStart;
    batch.endDate = newEnd;
    batch.timing = timing || batch.timing;
    if (capacity !== undefined) batch.capacity = Number(capacity);
    if (status) batch.status = status;

    await batch.save();

    const updatedBatch = await Batch.findById(batch._id)
      .populate('course', 'courseName totalFees duration')
      .populate('trainer', 'trainerId name email specialization');

    res.status(200).json({
      success: true,
      message: 'Batch updated successfully',
      data: updatedBatch
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete batch
// @route   DELETE /api/batches/:id
// @access  Admin
const deleteBatch = async (req, res, next) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }

    const activeEnrollments = await Enrollment.countDocuments({ batch: batch._id });
    if (activeEnrollments > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete batch. It has ${activeEnrollments} enrollment(s). Cancel enrollments or deactivate batch instead.`
      });
    }

    await batch.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Batch deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBatch,
  getBatches,
  getBatchById,
  updateBatch,
  deleteBatch
};
