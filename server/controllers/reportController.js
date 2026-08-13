const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Fee = require('../models/Fee');
const Result = require('../models/Result');
const Batch = require('../models/Batch');
const Enrollment = require('../models/Enrollment');

// @desc    Get Student Report
// @route   GET /api/reports/students
// @access  Admin / Trainer
const getStudentReport = async (req, res, next) => {
  try {
    const { batchId, status } = req.query;

    let studentIds = null;
    if (batchId) {
      const enrollments = await Enrollment.find({ batch: batchId });
      studentIds = enrollments.map(e => e.student);
    }

    const query = {};
    if (status) query.status = status;
    if (studentIds) query._id = { $in: studentIds };

    const students = await Student.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Attendance Report
// @route   GET /api/reports/attendance
// @access  Admin / Trainer
const getAttendanceReport = async (req, res, next) => {
  try {
    const { batchId, studentId, startDate, endDate, status } = req.query;
    const query = {};

    if (batchId) query.batch = batchId;
    if (studentId) query.student = studentId;
    if (status) query.status = status;

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const records = await Attendance.find(query)
      .sort({ date: -1 })
      .populate('student', 'studentId name email phone')
      .populate('batch', 'batchName');

    res.status(200).json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Fee Report
// @route   GET /api/reports/fees
// @access  Admin / Trainer
const getFeeReport = async (req, res, next) => {
  try {
    const { batchId, paymentStatus } = req.query;
    const query = {};

    if (batchId) query.batch = batchId;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const fees = await Fee.find(query)
      .sort({ updatedAt: -1 })
      .populate('student', 'studentId name email phone')
      .populate({
        path: 'batch',
        select: 'batchName',
        populate: { path: 'course', select: 'courseName totalFees' }
      });

    const totalCollected = fees.reduce((sum, f) => sum + (f.paidAmount || 0), 0);
    const totalPending = fees.reduce((sum, f) => sum + (f.pendingAmount || 0), 0);

    res.status(200).json({
      success: true,
      count: fees.length,
      summary: { totalCollected, totalPending },
      data: fees
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Result Report
// @route   GET /api/reports/results
// @access  Admin / Trainer
const getResultReport = async (req, res, next) => {
  try {
    const { batchId, resultStatus } = req.query;
    const query = {};

    if (batchId) query.batch = batchId;
    if (resultStatus) query.resultStatus = resultStatus;

    const results = await Result.find(query)
      .sort({ percentage: -1 })
      .populate('student', 'studentId name email phone')
      .populate({
        path: 'batch',
        select: 'batchName',
        populate: { path: 'course', select: 'courseName' }
      });

    res.status(200).json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Batch Report
// @route   GET /api/reports/batches
// @access  Admin / Trainer
const getBatchReport = async (req, res, next) => {
  try {
    const { courseId, trainerId, status } = req.query;
    const query = {};

    if (courseId) query.course = courseId;
    if (trainerId) query.trainer = trainerId;
    if (status) query.status = status;

    const batches = await Batch.find(query)
      .populate('course', 'courseName totalFees duration')
      .populate('trainer', 'trainerId name specialization email');

    const reportData = await Promise.all(
      batches.map(async (b) => {
        const enrolledCount = await Enrollment.countDocuments({ batch: b._id, status: 'ENROLLED' });
        return {
          ...b.toObject(),
          enrolledCount,
          availableSeats: Math.max(0, b.capacity - enrolledCount)
        };
      })
    );

    res.status(200).json({
      success: true,
      count: reportData.length,
      data: reportData
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudentReport,
  getAttendanceReport,
  getFeeReport,
  getResultReport,
  getBatchReport
};
