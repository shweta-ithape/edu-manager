const express = require('express');
const router = express.Router();
const {
  createTrainer,
  getTrainers,
  getTrainerById,
  updateTrainer,
  deleteTrainer
} = require('../controllers/trainerController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.route('/')
  .post(authorize('ADMIN'), createTrainer)
  .get(authorize('ADMIN', 'TRAINER'), getTrainers);

router.route('/:id')
  .get(authorize('ADMIN', 'TRAINER'), getTrainerById)
  .put(authorize('ADMIN'), updateTrainer)
  .delete(authorize('ADMIN'), deleteTrainer);

module.exports = router;
