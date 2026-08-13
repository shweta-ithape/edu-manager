const Student = require('../models/Student');
const Trainer = require('../models/Trainer');
const Course = require('../models/Course');
const Batch = require('../models/Batch');
const Enrollment = require('../models/Enrollment');
const Attendance = require('../models/Attendance');
const Fee = require('../models/Fee');
const Result = require('../models/Result');

// @desc    Get dashboard metrics based on user role
// @route   GET /api/dashboard
// @access  Authenticated users
const getDashboardData = async (req, res, next) => {
  try {
    const role = req.user.role;

    if (role === 'ADMIN') {
      const [
        totalStudents,
        totalTrainers,
        totalCourses,
        activeBatches,
        totalEnrollments,
        feeRecords,
        attendanceRecords,
        resultsList,
        recentEnrollments,
        recentFees,
        coursesList
      ] = await Promise.all([
        Student.countDocuments(),
        Trainer.countDocuments(),
        Course.countDocuments(),
        Batch.countDocuments({ status: 'ACTIVE' }),
        Enrollment.countDocuments({ status: 'ENROLLED' }),
        Fee.find(),
        Attendance.find(),
        Result.find(),
        Enrollment.find().sort({ createdAt: -1 }).limit(5).populate('student', 'name studentId').populate('batch', 'batchName'),
        Fee.find().sort({ updatedAt: -1 }).limit(5).populate('student', 'name studentId'),
        Course.find()
      ]);

      // Fee metrics
      const totalFeesCollected = feeRecords.reduce((sum, f) => sum + (f.paidAmount || 0), 0);
      const totalPendingFees = feeRecords.reduce((sum, f) => sum + (f.pendingAmount || 0), 0);

      // Attendance metrics
      const totalAttendance = attendanceRecords.length;
      const totalPresent = attendanceRecords.filter(a => a.status === 'PRESENT').length;
      const overallAttendancePercentage = totalAttendance > 0 ? Number(((totalPresent / totalAttendance) * 100).toFixed(2)) : 0;

      // Pass/Fail statistics
      const passCount = resultsList.filter(r => r.resultStatus === 'PASS').length;
      const failCount = resultsList.filter(r => r.resultStatus === 'FAIL').length;
      const passPercentage = resultsList.length > 0 ? Number(((passCount / resultsList.length) * 100).toFixed(2)) : 0;

      // Recharts: Students by course aggregation
      const studentsByCourse = await Promise.all(
        coursesList.map(async (c) => {
          const batches = await Batch.find({ course: c._id });
          const batchIds = batches.map(b => b._id);
          const count = await Enrollment.countDocuments({ batch: { $in: batchIds }, status: 'ENROLLED' });
          return { courseName: c.courseName, count };
        })
      );

      // Recharts: Fee Collection Breakdown
      const feeCollection = [
        { name: 'Collected', value: totalFeesCollected },
        { name: 'Pending', value: totalPendingFees }
      ];

      // Recharts: Attendance Breakdown
      const attendanceStats = [
        { status: 'Present', count: totalPresent },
        { status: 'Absent', count: totalAttendance - totalPresent }
      ];

      return res.status(200).json({
        success: true,
        role: 'ADMIN',
        data: {
          metrics: {
            totalStudents,
            totalTrainers,
            totalCourses,
            activeBatches,
            totalEnrollments,
            totalFeesCollected,
            totalPendingFees,
            overallAttendancePercentage,
            passCount,
            failCount,
            passPercentage
          },
          charts: {
            studentsByCourse,
            feeCollection,
            attendanceStats
          },
          recentActivity: {
            recentEnrollments,
            recentFees
          }
        }
      });
    }

    if (role === 'TRAINER') {
      const trainer = await Trainer.findOne({ user: req.user.id });
      if (!trainer) {
        return res.status(404).json({ success: false, message: 'Trainer profile not found' });
      }

      const assignedBatches = await Batch.find({ trainer: trainer._id }).populate('course', 'courseName');
      const batchIds = assignedBatches.map(b => b._id);

      const totalStudentsCount = await Enrollment.countDocuments({ batch: { $in: batchIds }, status: 'ENROLLED' });

      // Today's attendance
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const nextDay = new Date(today);
      nextDay.setDate(nextDay.getDate() + 1);

      const todayAttendance = await Attendance.find({
        batch: { $in: batchIds },
        date: { $gte: today, $lt: nextDay }
      });

      const todayPresent = todayAttendance.filter(a => a.status === 'PRESENT').length;

      // Recent results entered by trainer
      const recentResults = await Result.find({ batch: { $in: batchIds } })
        .sort({ updatedAt: -1 })
        .limit(5)
        .populate('student', 'name studentId')
        .populate('batch', 'batchName');

      return res.status(200).json({
        success: true,
        role: 'TRAINER',
        data: {
          trainerInfo: trainer,
          assignedBatches,
          totalBatches: assignedBatches.length,
          totalStudentsCount,
          todayAttendanceCount: todayAttendance.length,
          todayPresentCount: todayPresent,
          recentResults
        }
      });
    }

    if (role === 'STUDENT') {
      const student = await Student.findOne({ user: req.user.id });
      if (!student) {
        return res.status(404).json({ success: false, message: 'Student profile not found' });
      }

      const enrollments = await Enrollment.find({ student: student._id })
        .populate({
          path: 'batch',
          populate: [
            { path: 'course', select: 'courseName duration totalFees' },
            { path: 'trainer', select: 'name email phone specialization' }
          ]
        });

      const attendanceRecords = await Attendance.find({ student: student._id });
      const totalClasses = attendanceRecords.length;
      const presentClasses = attendanceRecords.filter(a => a.status === 'PRESENT').length;
      const attendancePercentage = totalClasses > 0 ? Number(((presentClasses / totalClasses) * 100).toFixed(2)) : 0;

      const feeRecords = await Fee.find({ student: student._id }).populate({
        path: 'batch',
        select: 'batchName',
        populate: { path: 'course', select: 'courseName' }
      });

      const results = await Result.find({ student: student._id }).populate({
        path: 'batch',
        select: 'batchName',
        populate: { path: 'course', select: 'courseName' }
      });

      return res.status(200).json({
        success: true,
        role: 'STUDENT',
        data: {
          studentInfo: student,
          enrollments,
          attendance: {
            totalClasses,
            presentClasses,
            absentClasses: totalClasses - presentClasses,
            attendancePercentage
          },
          feeRecords,
          results
        }
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardData
};
