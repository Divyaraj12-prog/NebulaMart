const mongoose = require('mongoose');

function connectDB(){
    mongoose.connect(process.env.MONGO_URI)
    .then(()=>{
        console.log('Server Connected with DB');
    })
    .catch(()=>{
        console.log('Error connecting with DB');
    })
}

module.exports = connectDB;