const userModel = require('../models/user.model');
const orderModel = require('../models/order.model');
const productModel = require('../models/product.model');
const paymentModel = require('../models/payment.model');

async function getMetrics(req,res){
    try{

        // Get all products by the seller
        const sellerId = req.user.id;
        const products = await productModel.find({ seller: sellerId }).select('_id title').lean();
        const productIds = products.map(p => p._id.toString());

        if (!productIds.length) {
            return res.status(200).json({
                sales: 0,
                revenue: 0,
                topProducts: []
            });
        }
        
        // Get all orders containing the seller's products 
        const orders = await orderModel.find({ 'items.product': { $in: productIds } }).lean();

        const orderIds = orders.map(o => o._id);
        const completedPayments = await paymentModel.find({ order: { $in: orderIds }, status: 'COMPLETED' }).select('order').lean();
        const completedOrderIds = new Set(completedPayments.map(p => p.order.toString()));
        
        // Here we calculate sales and revenue for the seller based on their products in the orders 
        let sales = 0;
        let revenue = 0;
        const productStats = {};
        // Initialize product stats 
        for (const p of products) productStats[p._id.toString()] = { title: p.title, quantity: 0, revenue: 0 };
        
        for (const order of orders) {
            let orderSellerAmount = 0;
            for (const item of order.items) {
                const pid = item.product.toString();
                if (!productStats[pid]) continue;
                const qty = Number(item.quantity || 0);
                const price = item.price && item.price.amount ? Number(item.price.amount) : 0;
                const amount = qty * price;
                sales += qty;
                productStats[pid].quantity += qty;
                productStats[pid].revenue += amount;
                orderSellerAmount += amount;
            }
            if (completedOrderIds.has(order._id.toString())) {
                revenue += orderSellerAmount;
            }
        }
        // Determine top products by quantity sold 
        const topProducts = Object.entries(productStats)
            .map(([id, s]) => ({ productId: id, title: s.title, quantitySold: s.quantity, revenue: s.revenue }))
            .sort((a, b) => b.quantitySold - a.quantitySold)
            .slice(0, 5);

        return res.status(200).json({ sales, revenue, topProducts });
    }catch(err){
        return res.status(500).json({
            message: "Internal Server Error",
            error: err.message
        });
    }
}

async function getOrders(req,res){
    try{

        // Get all products by the seller
        const sellerId = req.user.id;
        const products = await productModel.find({ seller: sellerId }).select('_id').lean();
        // If no products found, return empty orders array 
        const productIds = products.map(p => p._id.toString());
        if (!productIds.length) {
            return res.status(200).json({ orders: [] });
        }
        // Get all orders containing the seller's products 
        const orders = await orderModel.find({ 'items.product': { $in: productIds } }).populate('user', 'name email').sort({ createdAt: -1 });
        // Filter order items to include only those sold by the seller 
        const filteredOrders = orders.map(order => {
            const sellerItems = order.items.filter(item => productIds.includes(item.product.toString()));
            return {
                ...order.toObject(),
                items: sellerItems
            };
        }).filter(order => order.items.length > 0);
        return res.status(200).json({ orders: filteredOrders });
    }catch(err){
        return res.status(500).json({
            message: "Internal Server Error",
            error: err.message
        });
    }
}

async function getProducts(req,res){
    try{
        const sellerId = req.user.id;
        const products = await productModel.find({ seller: sellerId });
        return res.status(200).json({ products });
    }catch(err){
        return res.status(500).json({
            message: "Internal Server Error",
            error: err.message
        });
    }
}
module.exports = {
    getMetrics,
    getOrders,
    getProducts
};