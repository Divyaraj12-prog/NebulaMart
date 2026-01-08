const express = require('express');
const router = express.Router();
const createauthMiddleware = require('../middleware/auth.middleware');
const paymentControllers = require('../controllers/payment.controller');

router.post('/create/:orderId', createauthMiddleware(['user']), paymentControllers.createPayment);

router.post('/verify', createauthMiddleware(['user']), paymentControllers.verifyPayment )

module.exports = router