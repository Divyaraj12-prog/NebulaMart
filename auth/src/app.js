const express = require('express');
const cookieParser = require('cookie-parser');
const authRouter = require('./routes/auth');

const app = express();

app.use(express.json());
app.use(cookieParser());

// Auth routes
app.use('/api/auth', authRouter);

module.exports = app;