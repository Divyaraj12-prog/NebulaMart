const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const productController = require('../controllers/product.controller');
const authMiddleware = require('../middleware/auth.middleware');
const productValidator = require('../middleware/product.validator');

// Post /api/products - Create a new product (only for admin and seller roles)
router.post('/',
     authMiddleware(['admin', 'seller']),
     upload.array('images', 5),
     productValidator.productValidation,
     productController.createProduct
);
// Get /api/products - Retrieve products with optional filters
router.get('/', productController.getProducts);

// Patch /api/products/:id - Update a product (only for seller role)
router.patch('/:id', authMiddleware(['seller']), productController.updateProduct);

router.delete('/:id', authMiddleware(['seller']), productController.deleteProduct);

router.get('/seller', authMiddleware(['seller']), productController.getSellerProducts);

// Get /api/products/:id - Retrieve a product by ID
router.get('/:id', productController.getProductById);


module.exports = router;