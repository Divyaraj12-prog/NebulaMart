const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }
    next();
};


const createOrderValidation = [
    body('shippingAddress.street')
        .isString()
        .withMessage('Street must be a string')
        .notEmpty()
        .withMessage('Street is required'),
    body('shippingAddress.city')
        .isString()
        .withMessage('City must be a string')
        .notEmpty()
        .withMessage('City is required'),
    // body('shippingAddress.zip')
    //     .isPostalCode('IN')
    //     .withMessage('Zip code must be a valid Indian postal code'),
    body('shippingAddress.state')
        .isString()
        .withMessage('State must be a string')
        .notEmpty()
        .withMessage('State is required'),
    body('shippingAddress.country')
        .isString()
        .withMessage('Country must be a string')
        .notEmpty()
        .withMessage('Country is required'),
    body('shippingAddress.pincode')
        .isString()
        .withMessage('Pincode must be a string')
        .notEmpty()
        .withMessage('Pincode is required')
        .matches(/^\d{6}$/)
        .withMessage('Pincode must be typical 6-digit format'),
    validate
]

const updateAddressValidation = [
    body('shippingAddress.street')
        .optional()
        .isString()
        .withMessage('Street must be a string')
        .notEmpty()
        .withMessage('Street is required'),
    body('shippingAddress.city')
        .optional()
        .isString()
        .withMessage('City must be a string')
        .notEmpty()
        .withMessage('City is required'),
    body('shippingAddress.state')
        .optional()
        .isString()
        .withMessage('State must be a string')
        .notEmpty()
        .withMessage('State is required'),
    body('shippingAddress.pincode')
        .optional()
        .isString()
        .withMessage('Pincode must be a string')
        .notEmpty()
        .withMessage('Pincode is required')
        .matches(/^\d{6}$/)
        .withMessage('Pincode must be typical 6-digit format'),
    body('shippingAddress.country')
        .optional()
        .isString()
        .withMessage('Country must be a string')
        .notEmpty()
        .withMessage('Country is required'),
        validate            
]

module.exports = { createOrderValidation, updateAddressValidation }