const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
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
  totalFees: {
    type: Number,
    required: [true, 'Total Fees is required'],
    min: [0, 'Total fees cannot be negative']
  },
  paidAmount: {
    type: Number,
    required: [true, 'Paid Amount is required'],
    min: [0, 'Paid amount cannot be negative'],
    default: 0
  },
  pendingAmount: {
    type: Number,
    required: [true, 'Pending Amount is required'],
    min: [0, 'Pending amount cannot be negative']
  },
  paymentStatus: {
    type: String,
    enum: ['PAID', 'PARTIAL', 'PENDING'],
    default: 'PENDING'
  },
  paymentDate: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Fee', feeSchema);
