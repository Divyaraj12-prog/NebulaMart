const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
    },
    price:{
        amount:{
            type:Number,
            required:true,
        },
        currency:{
            type:String,
            enum:['INR','USD',],
            default:'INR'
        }
    },
    seller:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
    },
    image:[
        {
            url:String,
            thumbnail:String,
            id:String
        }
    ],
    stock:{
        type: Number,
        default: 0
    }
})

productSchema.index({ title: 'text', description: 'text' });

const productModel = mongoose.model('Product',productSchema);

module.exports = productModel;