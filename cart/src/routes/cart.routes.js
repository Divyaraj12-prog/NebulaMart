const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const createauthMiddleware = require('../middleware/auth.middleware');
const validation = require('../middleware/validation.middleware');

router.get('/',
    createauthMiddleware(['user']),
    cartController.getCart
)

router.post('/items',
     validation.validateAddItemToCart,
     createauthMiddleware(['user']),
     cartController.addItemToCart);

router.patch('/items/:productId',
    validation.validateUpdatecartItem,
    createauthMiddleware(['user']),
    cartController.updateItemQuantity
)   

router.delete('/', 
    createauthMiddleware(['user']),
    cartController.deleteCart
)

module.exports = router;