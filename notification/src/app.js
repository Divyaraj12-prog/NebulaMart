const express = require('express');
const app = express();
const {connect} = require('./broker/broker');
const setupListeners = require('./broker/listners');

// Middleware to parse JSON requests
app.use(express.json());

connect().then(()=>{
    setupListeners();
});

app.get('/', (req, res) => {
    res.status(200).json({ message: 'Notification Service is running' });
});

module.exports = app;