const Result = require('../models/Result');
const Batch = require('../models/Batch');
const Student = require('../models/Student');
const Trainer = require('../models/Trainer');
const { calculateResultStatus } = require('../utils/businessLogic');

// @desc    Enter or update student result
// @route   POST /api/results
// @access  Trainer (assigned batch) / Admin
const saveResult = async (req, res, next) => {
  try {
    const { studentId, batchId, subjectMarks, remarks } = req.body;

    if (!studentId || !batchId || !Array.isArray(subjectMarks) || subjectMarks.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Student ID, Batch ID, and subject marks array are required'
      });
    }

    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }

    // Role check for Trainer
    if (req.user.role === 'TRAINER') {
      const trainer = await Trainer.findOne({ user: req.user.id });
      if (!trainer || batch.trainer.toString() !== trainer._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Trainers can only manage results for assigned batches.'
        });
      }
    }

    // Calculate marks & status on backend using business logic helper
    const resultCalc = calculateResultStatus(subjectMarks);

    const result = await Result.findOneAndUpdate(
      { student: studentId, batch: batchId },
      {
        student: studentId,
        batch: batchId,
        subjectMarks: resultCalc.subjectMarks,
        totalMarks: resultCalc.totalMarks,
        percentage: resultCalc.percentage,
        resultStatus: resultCalc.resultStatus,
        remarks: remarks || ''
      },
      { upsert: true, new: true, runValidators: true }
    );

    const populatedResult = await Result.findById(result._id)
      .populate('student', 'studentId name email')
      .populate({
        path: 'batch',
        select: 'batchName',
        populate: { path: 'course', select: 'courseName' }
      });

    res.status(200).json({
      success: true,
      message: 'Result saved successfully',
      data: populatedResult
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get results
// @route   GET /api/results
// @access  Admin / Trainer / Student (own)
const getResults = async (req, res, next) => {
  try {
    const { batchId, studentId, resultStatus } = req.query;
    const query = {};

    if (resultStatus) query.resultStatus = resultStatus;
    if (batchId) query.batch = batchId;
    if (studentId) query.student = studentId;

    // Student restriction
    if (req.user.role === 'STUDENT') {
      const student = await Student.findOne({ user: req.user.id });
      if (student) {
        query.student = student._id;
      }
    }

    const results = await Result.find(query)
      .sort({ createdAt: -1 })
      .populate('student', 'studentId name email phone')
      .populate({
        path: 'batch',
        select: 'batchName timing',
        populate: [
          { path: 'course', select: 'courseName duration' },
          { path: 'trainer', select: 'trainerId name' }
        ]
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

// @desc    Get single result by ID
// @route   GET /api/results/:id
// @access  Authenticated users
const getResultById = async (req, res, next) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate('student', 'studentId name email phone address')
      .populate({
        path: 'batch',
        select: 'batchName timing startDate endDate',
        populate: [
          { path: 'course', select: 'courseName duration totalFees' },
          { path: 'trainer', select: 'trainerId name email specialization' }
        ]
      });

    if (!result) {
      return res.status(404).json({ success: false, message: 'Result record not found' });
    }

    if (req.user.role === 'STUDENT') {
      const student = await Student.findOne({ user: req.user.id });
      if (student && result.student._id.toString() !== student._id.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied to other student results' });
      }
    }

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete result
// @route   DELETE /api/results/:id
// @access  Admin
const deleteResult = async (req, res, next) => {
  try {
    const result = await Result.findById(req.params.id);
    if (!result) {
      return res.status(404).json({ success: false, message: 'Result record not found' });
    }

    await result.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Result record deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  saveResult,
  getResults,
  getResultById,
  deleteResult
};
