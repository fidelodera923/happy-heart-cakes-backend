const express = require('express');
const router = express.Router();
const {
  createReview,
  getApprovedReviews,
  getAllReviews,
  approveReview,
  deleteReview
} = require('../controllers/reviewController');
const { protect, admin } = require('../middleware/auth');

router.get('/', getApprovedReviews);
router.post('/', protect, createReview);
router.get('/all', protect, admin, getAllReviews);
router.put('/:id/approve', protect, admin, approveReview);
router.delete('/:id', protect, admin, deleteReview);

module.exports = router;