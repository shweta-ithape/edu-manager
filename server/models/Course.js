const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  courseName: {
    type: String,
    required: [true, 'Course Name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  duration: {
    type: String,
    required: [true, 'Duration is required'],
    trim: true
  },
  totalFees: {
    type: Number,
    required: [true, 'Total Fees is required'],
    min: [0, 'Total fees cannot be negative']
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE'],
    default: 'ACTIVE'
  }
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
