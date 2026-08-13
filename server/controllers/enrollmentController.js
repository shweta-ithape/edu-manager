const Enrollment = require('../models/Enrollment');
const Student = require('../models/Student');
const Batch = require('../models/Batch');
const Fee = require('../models/Fee');
const { calculateFeeStatus } = require('../utils/businessLogic');

// @desc    Enroll a student in a batch
// @route   POST /api/enrollments
// @access  Admin
const createEnrollment = async (req, res, next) => {
  try {
    const { studentId, batchId, enrollmentDate } = req.body;

    if (!studentId || !batchId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID and Batch ID are required'
      });
    }

    // 1. Verify Student exists and is ACTIVE
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    if (student.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        message: `Student '${student.name}' is inactive. Only active students can be enrolled.`
      });
    }

    // 2. Verify Batch exists and is ACTIVE
    const batch = await Batch.findById(batchId).populate('course');
    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }
    if (batch.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        message: `Batch '${batch.batchName}' is not active (Status: ${batch.status}).`
      });
    }

    // 3. Prevent duplicate enrollment in same batch
    const existingEnrollment = await Enrollment.findOne({
      student: student._id,
      batch: batch._id
    });
    if (existingEnrollment) {
      return res.status(409).json({
        success: false,
        message: `Student '${student.name}' is already enrolled in batch '${batch.batchName}'.`
      });
    }

    // 4. Batch capacity check
    const currentEnrolledCount = await Enrollment.countDocuments({
      batch: batch._id,
      status: 'ENROLLED'
    });

    if (currentEnrolledCount >= batch.capacity) {
      return res.status(400).json({
        success: false,
        message: `Cannot enroll student. Batch '${batch.batchName}' is at maximum capacity (${batch.capacity}/${batch.capacity}).`
      });
    }

    // Create Enrollment
    const enrollment = await Enrollment.create({
      student: student._id,
      batch: batch._id,
      enrollmentDate: enrollmentDate || Date.now(),
      status: 'ENROLLED'
    });

    // Create initial Fee record automatically if not existing
    const totalFees = batch.course ? batch.course.totalFees : 0;
    const feeCalculation = calculateFeeStatus(totalFees, 0);

    await Fee.create({
      student: student._id,
      batch: batch._id,
      totalFees: feeCalculation.totalFees,
      paidAmount: 0,
      pendingAmount: feeCalculation.pendingAmount,
      paymentStatus: feeCalculation.paymentStatus
    });

    const populatedEnrollment = await Enrollment.findById(enrollment._id)
      .populate('student', 'studentId name email phone')
      .populate({
        path: 'batch',
        select: 'batchName timing startDate endDate',
        populate: { path: 'course', select: 'courseName totalFees' }
      });

    res.status(201).json({
      success: true,
      message: 'Student enrolled successfully',
      data: populatedEnrollment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all enrollments
// @route   GET /api/enrollments
// @access  Admin / Trainer / Student
const getEnrollments = async (req, res, next) => {
  try {
    const { batchId, studentId, status } = req.query;
    const query = {};

    if (status) query.status = status;
    if (batchId) query.batch = batchId;
    if (studentId) query.student = studentId;

    // Filter by student if logged-in user is STUDENT
    if (req.user.role === 'STUDENT') {
      const student = await Student.findOne({ user: req.user.id });
      if (student) {
        query.student = student._id;
      }
    }

    const enrollments = await Enrollment.find(query)
      .sort({ createdAt: -1 })
      .populate('student', 'studentId name email phone status')
      .populate({
        path: 'batch',
        select: 'batchName timing startDate endDate capacity status',
        populate: [
          { path: 'course', select: 'courseName totalFees duration' },
          { path: 'trainer', select: 'trainerId name email' }
        ]
      });

    res.status(200).json({
      success: true,
      count: enrollments.length,
      data: enrollments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel/Update Enrollment Status
// @route   PUT /api/enrollments/:id
// @access  Admin
const updateEnrollmentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['ENROLLED', 'COMPLETED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be ENROLLED, COMPLETED, or CANCELLED'
      });
    }

    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment record not found' });
    }

    enrollment.status = status;
    await enrollment.save();

    res.status(200).json({
      success: true,
      message: `Enrollment status updated to ${status}`,
      data: enrollment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Enrollment
// @route   DELETE /api/enrollments/:id
// @access  Admin
const deleteEnrollment = async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment record not found' });
    }

    await enrollment.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Enrollment deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEnrollment,
  getEnrollments,
  updateEnrollmentStatus,
  deleteEnrollment
};
