const Fee = require('../models/Fee');
const Student = require('../models/Student');
const Batch = require('../models/Batch');
const { calculateFeeStatus } = require('../utils/businessLogic');

// @desc    Record or update payment for a student
// @route   PUT /api/fees/:id
// @access  Admin
const recordPayment = async (req, res, next) => {
  try {
    const { paidAmount, paymentDate } = req.body;
    if (paidAmount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Paid amount is required'
      });
    }

    let fee = await Fee.findById(req.params.id);
    if (!fee) {
      return res.status(404).json({ success: false, message: 'Fee record not found' });
    }

    const newPaidTotal = Number(paidAmount);

    // Business validation via helper
    const statusResult = calculateFeeStatus(fee.totalFees, newPaidTotal);

    fee.paidAmount = statusResult.paidAmount;
    fee.pendingAmount = statusResult.pendingAmount;
    fee.paymentStatus = statusResult.paymentStatus;
    fee.paymentDate = paymentDate || Date.now();

    await fee.save();

    const updatedFee = await Fee.findById(fee._id)
      .populate('student', 'studentId name email phone')
      .populate({
        path: 'batch',
        select: 'batchName',
        populate: { path: 'course', select: 'courseName totalFees' }
      });

    res.status(200).json({
      success: true,
      message: 'Payment recorded successfully',
      data: updatedFee
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all fee records
// @route   GET /api/fees
// @access  Admin / Trainer / Student
const getFees = async (req, res, next) => {
  try {
    const { studentId, batchId, paymentStatus } = req.query;
    const query = {};

    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (batchId) query.batch = batchId;
    if (studentId) query.student = studentId;

    // If student role, filter own records
    if (req.user.role === 'STUDENT') {
      const student = await Student.findOne({ user: req.user.id });
      if (student) {
        query.student = student._id;
      }
    }

    const fees = await Fee.find(query)
      .sort({ updatedAt: -1 })
      .populate('student', 'studentId name email phone')
      .populate({
        path: 'batch',
        select: 'batchName timing',
        populate: { path: 'course', select: 'courseName totalFees' }
      });

    // Summary statistics
    const totalCollected = fees.reduce((sum, f) => sum + (f.paidAmount || 0), 0);
    const totalPending = fees.reduce((sum, f) => sum + (f.pendingAmount || 0), 0);

    res.status(200).json({
      success: true,
      count: fees.length,
      summary: {
        totalCollected,
        totalPending
      },
      data: fees
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single fee record
// @route   GET /api/fees/:id
// @access  Authenticated users
const getFeeById = async (req, res, next) => {
  try {
    const fee = await Fee.findById(req.params.id)
      .populate('student', 'studentId name email phone address')
      .populate({
        path: 'batch',
        select: 'batchName timing',
        populate: { path: 'course', select: 'courseName totalFees duration' }
      });

    if (!fee) {
      return res.status(404).json({ success: false, message: 'Fee record not found' });
    }

    res.status(200).json({
      success: true,
      data: fee
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  recordPayment,
  getFees,
  getFeeById
};
