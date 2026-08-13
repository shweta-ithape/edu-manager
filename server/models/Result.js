const mongoose = require('mongoose');

const subjectMarkSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
    trim: true
  },
  marksObtained: {
    type: Number,
    required: true,
    min: [0, 'Marks cannot be negative'],
    max: [100, 'Marks cannot exceed 100']
  },
  maxMarks: {
    type: Number,
    default: 100
  }
}, { _id: false });

const resultSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student is required']
  },
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: [true, 'Batch is required']
  },
  subjectMarks: [subjectMarkSchema],
  totalMarks: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true
  },
  resultStatus: {
    type: String,
    enum: ['PASS', 'FAIL'],
    required: true
  },
  remarks: {
    type: String,
    trim: true
  }
}, { timestamps: true });

// Prevent multiple results for same student in same batch
resultSchema.index({ student: 1, batch: 1 }, { unique: true });

module.exports = mongoose.model('Result', resultSchema);
