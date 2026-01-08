const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const createauthMiddleware = require('../middleware/auth.middleware');
const validation= require('../middleware/validation.middleware');

router.post('/',
    createauthMiddleware(['user']),
    validation.createOrderValidation,
    orderController.createOrder
)

router.get('/me', createauthMiddleware(['user']), orderController.getMyOrder)

router.post('/:id/cancel', createauthMiddleware(['user']), orderController.cancelOrder)

router.patch('/:id/address', createauthMiddleware(['user']), validation.updateAddressValidation, orderController.updateOrderAddress)

router.get('/:id', createauthMiddleware(['user', 'admin']), orderController.getOrderById)

module.exports = router;