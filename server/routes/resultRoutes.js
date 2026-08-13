const express = require('express');
const router = express.Router();
const {
  saveResult,
  getResults,
  getResultById,
  deleteResult
} = require('../controllers/resultController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.post('/', authorize('ADMIN', 'TRAINER'), saveResult);
router.get('/', getResults);
router.get('/:id', getResultById);
router.delete('/:id', authorize('ADMIN'), deleteResult);

module.exports = router;
