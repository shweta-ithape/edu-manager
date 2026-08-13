const express = require('express');
const router = express.Router();
const {
  recordPayment,
  getFees,
  getFeeById
} = require('../controllers/feeController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/', getFees);
router.get('/:id', getFeeById);
router.put('/:id', authorize('ADMIN'), recordPayment);

module.exports = router;
