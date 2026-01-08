const mongoose = require('mongoose');

function connectDb(req,res){
    mongoose.connect(process.env.MONGO_URI)
    .then(()=>{
        console.log('Connected to DB');
    })
    .catch((err)=>{
        console.log('Error connecting to DB', err);
    })
}

module.exports = connectDb;