const express = require('express');
const router = express.Router();
const {
  createBatch,
  getBatches,
  getBatchById,
  updateBatch,
  deleteBatch
} = require('../controllers/batchController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.route('/')
  .post(authorize('ADMIN'), createBatch)
  .get(getBatches);

router.route('/:id')
  .get(getBatchById)
  .put(authorize('ADMIN'), updateBatch)
  .delete(authorize('ADMIN'), deleteBatch);

module.exports = router;
