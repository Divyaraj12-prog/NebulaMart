require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/db/db');
const {connect} = require('./src/broker/broker');
const listen = require('./src/broker/listener');

connectDB();
connect().then(()=>{
    listen();
});

app.listen(3007, ()=>{
    console.log('Seller Dashboard service running on port 3007');
})