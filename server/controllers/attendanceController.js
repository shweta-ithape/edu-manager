const Attendance = require('../models/Attendance');
const Batch = require('../models/Batch');
const Student = require('../models/Student');
const Trainer = require('../models/Trainer');
const Enrollment = require('../models/Enrollment');

// @desc    Mark attendance for a batch on a specific date
// @route   POST /api/attendance
// @access  Trainer / Admin
const markAttendance = async (req, res, next) => {
  try {
    const { batchId, date, records } = req.body;
    // records: Array of { studentId, status: 'PRESENT' | 'ABSENT' }

    if (!batchId || !date || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Batch ID, date, and student attendance records are required'
      });
    }

    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }

    // Role check: If logged-in user is TRAINER, verify assignment
    if (req.user.role === 'TRAINER') {
      const trainer = await Trainer.findOne({ user: req.user.id });
      if (!trainer || batch.trainer.toString() !== trainer._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only mark attendance for batches assigned to you.'
        });
      }
    }

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    const savedRecords = [];
    const errors = [];

    for (const item of records) {
      try {
        const { studentId, status } = item;
        if (!['PRESENT', 'ABSENT'].includes(status)) {
          errors.push({ studentId, error: 'Status must be PRESENT or ABSENT' });
          continue;
        }

        // Upsert attendance record to handle updates seamlessly
        const record = await Attendance.findOneAndUpdate(
          {
            student: studentId,
            batch: batchId,
            date: targetDate
          },
          {
            student: studentId,
            batch: batchId,
            date: targetDate,
            status
          },
          { upsert: true, new: true, runValidators: true }
        );

        savedRecords.push(record);
      } catch (err) {
        errors.push({ studentId: item.studentId, error: err.message });
      }
    }

    res.status(200).json({
      success: true,
      message: `Attendance recorded for ${savedRecords.length} student(s)`,
      count: savedRecords.length,
      errors: errors.length > 0 ? errors : undefined,
      data: savedRecords
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance records & percentage statistics
// @route   GET /api/attendance
// @access  Admin / Trainer / Student
const getAttendance = async (req, res, next) => {
  try {
    const { batchId, studentId, date, startDate, endDate } = req.query;
    const query = {};

    if (batchId) query.batch = batchId;
    if (studentId) query.student = studentId;

    if (date) {
      const d = new Date(date);
      d.setHours(0,0,0,0);
      const nextDay = new Date(d);
      nextDay.setDate(nextDay.getDate() + 1);
      query.date = { $gte: d, $lt: nextDay };
    } else if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Role check for STUDENT
    if (req.user.role === 'STUDENT') {
      const student = await Student.findOne({ user: req.user.id });
      if (student) {
        query.student = student._id;
      }
    }

    const records = await Attendance.find(query)
      .sort({ date: -1 })
      .populate('student', 'studentId name email phone')
      .populate('batch', 'batchName timing');

    // Calculate percentage summary
    let summary = null;
    if (studentId || req.user.role === 'STUDENT') {
      const totalClasses = records.length;
      const presentClasses = records.filter(r => r.status === 'PRESENT').length;
      const percentage = totalClasses > 0 ? Number(((presentClasses / totalClasses) * 100).toFixed(2)) : 0;

      summary = {
        totalClasses,
        presentClasses,
        absentClasses: totalClasses - presentClasses,
        percentage
      };
    }

    res.status(200).json({
      success: true,
      count: records.length,
      summary,
      data: records
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance percentage summary for all students in a batch
// @route   GET /api/attendance/batch-summary/:batchId
// @access  Admin / Trainer
const getBatchAttendanceSummary = async (req, res, next) => {
  try {
    const { batchId } = req.params;

    const enrollments = await Enrollment.find({ batch: batchId, status: 'ENROLLED' })
      .populate('student', 'studentId name email phone');

    const summary = await Promise.all(
      enrollments.map(async (e) => {
        const student = e.student;
        const total = await Attendance.countDocuments({ batch: batchId, student: student._id });
        const present = await Attendance.countDocuments({ batch: batchId, student: student._id, status: 'PRESENT' });
        const percentage = total > 0 ? Number(((present / total) * 100).toFixed(2)) : 0;

        return {
          studentId: student._id,
          studentCode: student.studentId,
          name: student.name,
          email: student.email,
          totalClasses: total,
          presentClasses: present,
          absentClasses: total - present,
          percentage
        };
      })
    );

    res.status(200).json({
      success: true,
      count: summary.length,
      data: summary
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  markAttendance,
  getAttendance,
  getBatchAttendanceSummary
};
