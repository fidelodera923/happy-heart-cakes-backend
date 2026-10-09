const express = require('express');
const router = express.Router();
const {
  createCustomRequest,
  getAllCustomRequests,
  deleteCustomRequest
} = require('../controllers/customRequestController');
const { protect, admin } = require('../middleware/auth');

router.post('/', protect, createCustomRequest);
router.get('/', protect, admin, getAllCustomRequests);
router.delete('/:id', protect, admin, deleteCustomRequest);

module.exports = router;