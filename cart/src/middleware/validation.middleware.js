const {body, validationResult, param} = require('express-validator');
const { default: mongoose } = require('mongoose');

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

const validateAddItemToCart = [
    body('productId')
    .isString()
    .withMessage('Product ID must be a string')
    .custom(value => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid Product ID'),
    body('qty').isInt({gt:0}).withMessage('Quantity must be an integer greater than 0'),
    validate,
]

const validateUpdatecartItem = [
    param('productId')
    .isString()
    .withMessage('Product ID must be a string')
    .custom(value => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid product ID format'),
    body('qty').isInt({gt:0}).withMessage('Quantity must be a positive integer'),
    validate
]
module.exports = {
    validateAddItemToCart,
    validateUpdatecartItem
};