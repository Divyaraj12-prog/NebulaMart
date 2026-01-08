const express = require('express');
const cookiesParser = require('cookie-parser');
const sellerRoutes = require('./routes/seller.routes');
const app = express();

app.use(express.json());
app.use(cookiesParser());

app.get('/', (req, res) => {
    res.status(200).json({ message: 'Seller Dashboard Service is running' });
});

app.use('/api/seller/dashboard', sellerRoutes);

module.exports = app;