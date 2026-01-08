const productModel = require('../models/product.model');
const imagekitClient = require('../services/imagekit.client');
const mongoose = require('mongoose');
const { publishToQueue } = require('../broker/broker');

async function createProduct(req, res) {
    try {
        const { title, description, priceAmount, prizeCurrency = 'INR' } = req.body;

        if (!title || !priceAmount) {
            return res.status(400).json({
                message: 'Title Price Amount and seller are required',
            });
        }

        const seller = req.user.id;

        const price = {
            amount: Number(priceAmount),
            currency: prizeCurrency,
        };

        const files = req.files || [];
        const uploaded = await Promise.all(
            files.map((file) => imagekitClient.uploadFile(file.buffer, file.originalname))
        );

        const images = uploaded.map((u) => ({ url: u.url, thumbnail: u.thumbnail, id: u.fileId }));

        const Product = await productModel.create({
            title,
            description,
            price,
            seller,
            image: images,
        });

        await publishToQueue('PRODUCT_SELLER_DASHBOARD.PRODUCT_CREATED', Product);
        await publishToQueue('PRODUCT_NOTIFICATION.PRODUCT.CREATED', {
            email: req.user.email,
            id: Product._id,
            seller: Product.seller,
            fullname: req.user.fullname,
            title: Product.title,
        });

        return res.status(201).json(Product);
    } catch (err) {
        console.error('Error creating product:', err);
        return res.status(500).json({
            message: 'Internal server error',
        });
    }
}

async function getProducts(req, res) {
    const { q, minPrice, maxPrice, skip, limit = 20 } = req.query;

    const filter = {};

    if (q) {
        filter.$text = { $search: q };
    }
    if (minPrice) {
        filter['price.amount'] = { ...filter['price.amount'], $gte: Number(minPrice) };
    }
    if (maxPrice) {
        filter['price.amount'] = { ...filter['price.amount'], $lte: Number(maxPrice) };
    }

    const products = await productModel.find(filter).skip(Number(skip)).limit(Math.min(Number(limit), 20));

    return res.status(200).json({ data: products });
}

async function getProductById(req, res) {
    const { id } = req.params;
    try {
        const product = await productModel.findById(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        return res.status(200).json(product);
    } catch (err) {
        console.error('Error fetching product:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

async function updateProduct(req, res) {
    const { id } = req.params;
     
    if(!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Product not found' });
    }
     const product = await productModel.findOne({
        _id: id,
       }); 

    if (!product) {
        return res.status(404).json({ message: 'You are not authorized to update this product' });
    }

    if (product.seller.toString() !== req.user.id) {
        return res.status(403).json({ message: 'You are not authorized to update this product' });
    }
    const allowedUpdates = ['title', 'description', 'price'];
    for(const key of Object.keys(req.body)) {
        if(allowedUpdates.includes(key)){
            if(key === 'price' && typeof req.body.price === 'object') {
                if(req.body.price.amount !== undefined) {
                    product.price.amount = Number(req.body.price.amount);
                }
                if(req.body.price.currency !== undefined) {
                    product.price.currency = req.body.price.currency;
                }
            } else {
                product[key] = req.body[key];
            }
        }
    }

    await product.save();
    return res.status(200).json({
        message: 'Product updated successfully',
        product
    });

}

async function deleteProduct(req, res) {
    const { id } = req.params;

    if(!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Product not found' });
    }

    const product = await productModel.findOne({ _id: id });
    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }

    if (product.seller.toString() !== req.user.id) {
        return res.status(403).json({ message: 'You are not authorized to delete this product' });
    }

    await product.findOneAndDelete({ _id: id });
    return res.status(200).json({ message: 'Product deleted successfully' });
}

async function getSellerProducts(req, res) {
    const seller = req.user;
    const {skip=0, limit = 20} = req.query;

    const products = await productModel.find({ seller: seller.id }).skip(Number(skip)).limit(Math.min(Number(limit), 20));
    if (!products) {
        return res.status(404).json({ message: 'No products found for this seller' });
    }
    if(products.seller.toString() !== req.user.id) {
        return res.status(403).json({ message: 'You are not authorized to view these products' });
    }
    return res.status(200).json({ data: products });

}


module.exports = { createProduct, getProducts, getProductById, updateProduct, deleteProduct, getSellerProducts };