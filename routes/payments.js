const express = require('express');
const router = express.Router();
const { stkPush, mpesaCallback } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.post('/mpesa/stkpush', protect, stkPush);
router.post('/mpesa/callback', mpesaCallback);

module.exports = router;