const mongoose = require('mongoose');

async function connectDB() {
     mongoose.connect(process.env.MONGO_URI)
    .then((process)=>{
        console.log('Connected to DB');
    })
    .catch((err)=>{
        console.log('Database connection failed', err);
    });
}

module.exports = connectDB;