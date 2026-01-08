const cartModel = require('../models/cart.model');

async function addItemToCart(req, res){
  const {productId, qty} = req.body;
    const userId = req.user;

    const cart = await cartModel.findOne({user: userId.id});
    if(!cart){
        cart = new cartModel({user: userId, items: []});
    }

    const existingItemIndex = cart.items.findIndex(item=> item.productId.toString()===productId);
    if(existingItemIndex>=0){
        cart.items[existingItemIndex].quantity+=qty
    }else{
        cart.items.push({productId, quantity:qty});
    }

    await cart.save();
    return res.status(200).json({
        message: 'Cart added succesfully',
        cart
    })
}

async function updateItemQuantity(res,req){
    const {productId} = req.params;
    const qty = req.body;
    const user= req.user;
    
    const cart = await cartModel.findOne({user: user.id});
    if(!cart){
        return res.status(404).json({
            message: "Cart not found"
        })
    }
    const existingItemIndex = cart.items.findIndex(item => item.productId.isString()===productId);
    if(existingItemIndex<0){
      return res.status(404).json({
        message: "Item not found"
      })
    }
    cart.items[existingItemIndex].quantity+=qty;
    await cart.save();
    return res.json(200).json({
        message:"Cart Updated",
        cart
    })

}

async function getCart(req,res){
    const user = req.user;
    let cart = await cartModel.findOne({user: user.id});
    if(!cart){
        cart = new cartModel({user: user.id, items:[]})
        await cart.save();
    }
    return res.status(200).json({
        message: "Cart Items Fetched",
        cart,
        totals:{
            itemCount: cart.items.length,
            totalQuantity: cart.items.reduce((sum,item)=> sum + item.quantity, 0)
        }
    });
}

async function deleteCart(req, res){
  const user = req.user;
  await cartModel.findOneAndDelete({user: user.id});
  return res.status(200).json({
    message: "Deleted Succesfully",
    cart
  })
}

module.exports = {
    addItemToCart,
    updateItemQuantity,
    getCart,
    deleteCart
};