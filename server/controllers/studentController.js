const bcrypt = require('bcryptjs');
const Student = require('../models/Student');
const User = require('../models/User');

// @desc    Create a new student
// @route   POST /api/students
// @access  Admin
const createStudent = async (req, res, next) => {
  try {
    const { studentId, name, email, phone, address, joiningDate, status, password } = req.body;

    if (!studentId || !name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Student ID, Name, Email, and Phone are required'
      });
    }

    // Check duplicate studentId or email
    const existingStudent = await Student.findOne({
      $or: [{ studentId: studentId.trim() }, { email: email.toLowerCase().trim() }]
    });

    if (existingStudent) {
      return res.status(409).json({
        success: false,
        message: existingStudent.studentId === studentId.trim()
          ? 'Student ID already exists'
          : 'Email already registered'
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'A user account with this email already exists'
      });
    }

    // Hash password (default: password123)
    const rawPassword = password || 'password123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(rawPassword, salt);

    // Create User account
    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: 'STUDENT',
      status: status || 'ACTIVE'
    });

    // Create Student record
    const student = await Student.create({
      studentId: studentId.trim(),
      name,
      email: email.toLowerCase().trim(),
      phone,
      address,
      joiningDate: joiningDate || Date.now(),
      status: status || 'ACTIVE',
      user: user._id
    });

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: student
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all students with search, filter, pagination
// @route   GET /api/students
// @access  Admin / Trainer
const getStudents = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const { search, status } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Student.countDocuments(query);
    const students = await Student.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'email role status');

    res.status(200).json({
      success: true,
      count: students.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: students
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Admin / Trainer / Student (own)
const getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id).populate('user', 'email role status');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // If student role, ensure viewing own profile
    if (req.user.role === 'STUDENT' && student.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied to other student profiles' });
    }

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Admin
const updateStudent = async (req, res, next) => {
  try {
    let student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const { name, email, phone, address, status, joiningDate } = req.body;

    if (email && email.toLowerCase() !== student.email) {
      const emailExists = await Student.findOne({ email: email.toLowerCase(), _id: { $ne: student._id } });
      if (emailExists) {
        return res.status(409).json({ success: false, message: 'Email is already in use by another student' });
      }
    }

    student.name = name || student.name;
    student.email = email ? email.toLowerCase().trim() : student.email;
    student.phone = phone || student.phone;
    student.address = address !== undefined ? address : student.address;
    student.status = status || student.status;
    if (joiningDate) student.joiningDate = joiningDate;

    await student.save();

    // Sync User record
    if (student.user) {
      await User.findByIdAndUpdate(student.user, {
        name: student.name,
        email: student.email,
        status: student.status
      });
    }

    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: student
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Admin
const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    if (student.user) {
      await User.findByIdAndDelete(student.user);
    }
    await student.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent
};
