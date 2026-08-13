const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  batchName: {
    type: String,
    required: [true, 'Batch Name is required'],
    trim: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course is required']
  },
  trainer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trainer',
    required: [true, 'Trainer is required']
  },
  startDate: {
    type: Date,
    required: [true, 'Start Date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End Date is required']
  },
  timing: {
    type: String,
    required: [true, 'Timing is required'],
    trim: true
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: [1, 'Capacity must be at least 1']
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'COMPLETED'],
    default: 'ACTIVE'
  }
}, { timestamps: true });

module.exports = mongoose.model('Batch', batchSchema);
