const bcrypt = require('bcryptjs');
const Trainer = require('../models/Trainer');
const User = require('../models/User');

// @desc    Create a new trainer
// @route   POST /api/trainers
// @access  Admin
const createTrainer = async (req, res, next) => {
  try {
    const { trainerId, name, email, phone, specialization, joiningDate, status, password } = req.body;

    if (!trainerId || !name || !email || !phone || !specialization) {
      return res.status(400).json({
        success: false,
        message: 'Trainer ID, Name, Email, Phone, and Specialization are required'
      });
    }

    const existingTrainer = await Trainer.findOne({
      $or: [{ trainerId: trainerId.trim() }, { email: email.toLowerCase().trim() }]
    });

    if (existingTrainer) {
      return res.status(409).json({
        success: false,
        message: existingTrainer.trainerId === trainerId.trim()
          ? 'Trainer ID already exists'
          : 'Email already registered'
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User account with this email already exists'
      });
    }

    const rawPassword = password || 'password123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(rawPassword, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: 'TRAINER',
      status: status || 'ACTIVE'
    });

    const trainer = await Trainer.create({
      trainerId: trainerId.trim(),
      name,
      email: email.toLowerCase().trim(),
      phone,
      specialization,
      joiningDate: joiningDate || Date.now(),
      status: status || 'ACTIVE',
      user: user._id
    });

    res.status(201).json({
      success: true,
      message: 'Trainer created successfully',
      data: trainer
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all trainers
// @route   GET /api/trainers
// @access  Admin / Trainer
const getTrainers = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const query = {};

    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { trainerId: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } }
      ];
    }

    const trainers = await Trainer.find(query)
      .sort({ createdAt: -1 })
      .populate('user', 'email role status');

    res.status(200).json({
      success: true,
      count: trainers.length,
      data: trainers
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single trainer
// @route   GET /api/trainers/:id
// @access  Admin / Trainer
const getTrainerById = async (req, res, next) => {
  try {
    const trainer = await Trainer.findById(req.params.id).populate('user', 'email role status');
    if (!trainer) {
      return res.status(404).json({ success: false, message: 'Trainer not found' });
    }

    res.status(200).json({
      success: true,
      data: trainer
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update trainer
// @route   PUT /api/trainers/:id
// @access  Admin
const updateTrainer = async (req, res, next) => {
  try {
    let trainer = await Trainer.findById(req.params.id);
    if (!trainer) {
      return res.status(404).json({ success: false, message: 'Trainer not found' });
    }

    const { name, email, phone, specialization, status, joiningDate } = req.body;

    if (email && email.toLowerCase() !== trainer.email) {
      const emailExists = await Trainer.findOne({ email: email.toLowerCase(), _id: { $ne: trainer._id } });
      if (emailExists) {
        return res.status(409).json({ success: false, message: 'Email already used by another trainer' });
      }
    }

    trainer.name = name || trainer.name;
    trainer.email = email ? email.toLowerCase().trim() : trainer.email;
    trainer.phone = phone || trainer.phone;
    trainer.specialization = specialization || trainer.specialization;
    trainer.status = status || trainer.status;
    if (joiningDate) trainer.joiningDate = joiningDate;

    await trainer.save();

    if (trainer.user) {
      await User.findByIdAndUpdate(trainer.user, {
        name: trainer.name,
        email: trainer.email,
        status: trainer.status
      });
    }

    res.status(200).json({
      success: true,
      message: 'Trainer updated successfully',
      data: trainer
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete trainer
// @route   DELETE /api/trainers/:id
// @access  Admin
const deleteTrainer = async (req, res, next) => {
  try {
    const trainer = await Trainer.findById(req.params.id);
    if (!trainer) {
      return res.status(404).json({ success: false, message: 'Trainer not found' });
    }

    if (trainer.user) {
      await User.findByIdAndDelete(trainer.user);
    }
    await trainer.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Trainer deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTrainer,
  getTrainers,
  getTrainerById,
  updateTrainer,
  deleteTrainer
};
