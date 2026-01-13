const orderModel = require('../models/order.model');
const axios = require('axios');
const {publishToQueue} = require("../broker/broker");

async function createOrder(req, res) {
    const user = req.user;
    const token = req.cookies?.token || req.headers?.authorization?.split(' ')[1];

    try {
        // Fetch user cart from cart service it will give productId and qty
        const cartRes = await axios.get('http://nebulamart-ALB-1425170346.ap-south-1.elb.amazonaws.com/api/cart/', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        console.log('Cart Response', cartRes.data.cart.items);

        // Through productId give a get request to product service and get that product
        const product = await Promise.all(cartRes.data.cart.items.map(async (item) => {
            return (await axios.get(`http://nebulamart-ALB-1425170346.ap-south-1.elb.amazonaws.com/api/products/${item.productId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })).data
        }))


        console.log('Products Fetched', product);

        // Calculate Product's prices by doing price * qty if 2 products 1000 becomes 2000
        let priceAmount = 0;
        const orderItems = cartRes.data.cart.items.map((item, index) => {

            const products = product.find(p => p._id === item.productId)

            // If not in stock don't allow creation
            if (products.stock < item.quantity) {
                throw new Error(`Product ${products.title} is out of stock or insufficient stock`)
            }

            const itemTotal = products.price.amount * item.quantity;
            priceAmount += itemTotal;

            return {
                product: item.productId,
                quantity: item.quantity,
                price: {
                    amount: itemTotal,
                    currency: products.price.currency
                }
            }
        })

        console.log('Total Price Amount', priceAmount)
        console.log(orderItems)

        const order = await orderModel.create({
            user: user.id,
            items: orderItems,
            status: 'PENDING',
            totalPrice: {
                amount: priceAmount,
                currency: 'INR'
            },
            shippingAddress: {
                street: req.body.shippingAddress.street,
                city: req.body.shippingAddress.city,
                state: req.body.shippingAddress.state,
                zip: req.body.shippingAddress.pincode,
                country: req.body.shippingAddress.country,
            }
        })

        await publishToQueue('ORDER_SELLER_DASHBOARD.ORDER_CREATED', order)
        return res.status(201).json({ order })

    } catch (err) {
        console.log(err);

        return res.status(500).json({
            message: "Internal server error",
            error: err.message
        })
    }
}

async function getMyOrder(req, res) {
    const user = req.user;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    try {
        const order = await orderModel.findOne({ user: user.id });
        const totalOrders = await orderModel.countDocuments({ user: user.id });

        return res.status(200).json({
            order,
            meta: {
                total: totalOrders,
                page,
                limit
            }
        })
    } catch (err) {
        console.log(err);

        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

async function getOrderById(req, res) {
    const user = req.user;
    const orderId = req.params.id;

    try {
        const order = await orderModel.findOne({ _id: orderId });
        if (!order) {
            return res.status(404).json({
                message: "order does not exist"
            })
        }
        if (order.user.toString() !== user.id) {
            return res.status(403).json({
                message: "Forbidden: You do not have access to this order"
            })
        }
        return res.status(200).json({ order });
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            message: "Internal Server Error",
            error: err.message
        })
    }
}

async function cancelOrder(req, res) {
    const user = req.user;
    const orderId = req.params.id;

    try {
        const order = await orderModel.find({_id: orderId });
        if (!order) {
            return res.status(404).json({
                message: "order does not exist"
            })
        }
        if (order.user.toString() !== user.id) {
            return res.status(403).json({
                message: "Forbidden: You do not have access to this order"
            })
        }
        // order can only be cancelled if it is not in pending status
        if (order.status !== 'PENDING') {
            return res.status(409).json({ message: "Order cannot be cancelled at this point" })
        }

        order.status = 'CANCELLED'
        await order.save();
        return res.status(200).json({ order })
    } catch (err) {
        return res.status(500).json({
            message: "Internal Server Error",
            error: err.message
        })
    }
}

async function updateOrderAddress(req, res) {
    const user = req.user;
    const orderId = req.params.id;

    try {
        const order = await orderModel.find({ _id: orderId });
        if (!order) {
            return res.status(404).json({
                message: "order does not exist"
            })
        }
        if (order.user.toString() !== user.id) {
            return res.status(403).json({
                message: "Forbidden: You do not have access to this order"
            })
        }
        // order can only be cancelled if it is not in pending status
        if (order.status !== 'PENDING') {
            return res.status(409).json({ message: "Order cannot be updated at this point" })
        }

        order.shippingAddress = {
            street: req.body.shippingAddress.street,
            city: req.body.shippingAddress.city,
            state: req.body.shippingAddress.state,
            zip: req.body.shippingAddress.pincode,
            country: req.body.shippingAddress.country,
        }

        await order.save();
        return res.status(200).json({
            message: "Order Address Updated Succesfully",
            order
        })
    } catch (err) {
       return res.status(500).json({
            message: "Internal Server Error",
            error: err.message
        })
    }
}

module.exports = {
    createOrder,
    getMyOrder,
    getOrderById,
    cancelOrder,
    updateOrderAddress
}