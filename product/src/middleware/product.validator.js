const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const productValidation = [
body('title')
  .trim()
  .notEmpty()
  .withMessage('Title is required'),
body('description')
  .optional()
  .isString()
  .withMessage('Description must be a string')
  .trim()
  .isLength({ max: 500 })
  .withMessage('Description can be at most 500 characters long'),
body('priceAmount')
  .notEmpty()
  .withMessage('priceAmount is required')
  .bail()
  .isFloat({gt: 0}).withMessage('priceAmount must be a number > 0'),
body('priceCurrency')
  .optional()
  .isIn(['INR', 'USD'])
  .withMessage('priceCurrency must be either INR or USD'), 
  validate
];



module.exports = { productValidation };
