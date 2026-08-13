/**
 * Business Rule: Fee Calculation
 * - paidAmount cannot be negative
 * - paidAmount cannot exceed totalFees
 * - pendingAmount = totalFees - paidAmount
 * - 0 paid = PENDING
 * - paid < total = PARTIAL
 * - paid = total = PAID
 */
const calculateFeeStatus = (totalFees, paidAmount) => {
  const total = Number(totalFees) || 0;
  const paid = Number(paidAmount) || 0;

  if (paid < 0) {
    throw new Error('Paid amount cannot be negative');
  }

  if (paid > total) {
    throw new Error(`Paid amount (₹${paid}) cannot exceed total fees (₹${total})`);
  }

  const pending = total - paid;
  let status = 'PENDING';
  if (paid === total && total > 0) {
    status = 'PAID';
  } else if (paid > 0) {
    status = 'PARTIAL';
  }

  return {
    totalFees: total,
    paidAmount: paid,
    pendingAmount: pending,
    paymentStatus: status
  };
};

/**
 * Business Rule: Result Calculation
 * - Marks must be between 0 and 100
 * - Calculate total marks and percentage on backend
 * - PASS if percentage >= 40, else FAIL
 */
const calculateResultStatus = (subjectMarks) => {
  if (!Array.isArray(subjectMarks) || subjectMarks.length === 0) {
    throw new Error('At least one subject mark is required');
  }

  let totalObtained = 0;
  let totalMax = 0;

  subjectMarks.forEach(item => {
    const marks = Number(item.marksObtained);
    const max = Number(item.maxMarks) || 100;

    if (isNaN(marks) || marks < 0 || marks > 100) {
      throw new Error(`Invalid marks for subject '${item.subject}'. Marks must be between 0 and 100.`);
    }

    totalObtained += marks;
    totalMax += max;
  });

  const percentage = Number(((totalObtained / totalMax) * 100).toFixed(2));
  const resultStatus = percentage >= 40 ? 'PASS' : 'FAIL';

  return {
    subjectMarks,
    totalMarks: totalObtained,
    percentage,
    resultStatus
  };
};

module.exports = {
  calculateFeeStatus,
  calculateResultStatus
};
