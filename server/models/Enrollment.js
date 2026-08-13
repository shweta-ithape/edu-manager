const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: true
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['ENROLLED', 'COMPLETED', 'CANCELLED'],
    default: 'ENROLLED'
  }
}, { timestamps: true });

// Prevent duplicate active enrollments for the same student in the same batch
enrollmentSchema.index({ student: 1, batch: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
