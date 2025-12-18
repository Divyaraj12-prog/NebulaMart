const {body, validationResult} = require('express-validator');

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { 
        return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }
    next();
};

const registerValidator = [
    body('username')
        .isString()
        .withMessage('Username must be a string')
        .isLength({ min: 3 })
        .withMessage('Username must be at least 3 characters long'),
    body('email')
        .isEmail()
        .withMessage('Email must be a valid email address'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    body('fullname.firstname')
        .isString()
        .withMessage('Firstname must be a string')
        .notEmpty()
        .withMessage('Firstname is required'),
    body('fullname.lastname')
        .isString()
        .withMessage('Lastname must be a string')
        .notEmpty()
        .withMessage('Lastname is required'),
    body('role')
        .optional()
        .isIn(['user', 'seller'])
        .withMessage('Role must be either user or seller'),    
        validate
]

const loginValidator = [
    body('username')
        .optional()
        .isString()
        .withMessage('Username must be a string'),
    body('email')
        .optional()
        .isEmail()
        .withMessage('Email must be a valid email address'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    (req, res, next) => {
        if (!req.body.username && !req.body.email) {
            return res.status(400).json({ message: 'Either username or email is required' });
        }
        validate(req, res, next);
    }
]

const addUserAddressValidator = [
    body('street')
        .isString()
        .withMessage('Street must be a string')
        .notEmpty()
        .withMessage('Street is required'),
    body('city')
        .isString()
        .withMessage('City must be a string')
        .notEmpty()
        .withMessage('City is required'),
    body('zip')
        .isPostalCode('IN')
        .withMessage('Zip code must be a valid Indian postal code'),
    body('pincode')
        .isString()
        .withMessage('State must be a string')
        .notEmpty()
        .withMessage('State is required')
        .matches(/^\d{6}$/)
        .withMessage('Pincode must be typical Indian 6-digit format'),
    body('country')
        .isString()
        .withMessage('Country must be a string')
        .notEmpty()
        .withMessage('Country is required'),
    body('pincode')
        .isString()
        .withMessage('Pincode must be a string')
        .notEmpty()
        .withMessage('Pincode is required')
        .matches(/^\d{6}$/)
        .withMessage('Pincode must be typical 6-digit format'),
    body('isDefault')
        .optional()
        .isBoolean()
        .withMessage('isDefault must be a boolean'),
    validate
]

module.exports = {
    registerValidator,
    loginValidator,
    addUserAddressValidator
}
