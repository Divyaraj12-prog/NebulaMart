const {tool} = require('@langchain/core/tools');
const axios = require('axios');
const {z}= require('zod');

const searchProduct = tool(async ({query, token})=>{
    console.log('Searching products for query:', query, 'with token:', token);
  const response = await axios.get(`http://nebulamart-ALB-1425170346.ap-south-1.elb.amazonaws.com/api/products?q=${query}`,{
    headers: {
      Authorization: `Bearer ${token}`
    },
  });
  return JSON.stringify(response.data);
}, {
  name: 'searchProduct',
  description: 'Search for Products based on query',
  schema: z.object({
    query: z.string().describe('Search Query for products')
  })

})

const addProductToCart = tool(async ({productId, qty = 1, token})=>{
    const response = await axios.post(`http://nebulamart-ALB-1425170346.ap-south-1.elb.amazonaws.com/api/cart/items`, {
        productId,
        qty
    }, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    return `Added product with id ${productId} and quantity ${qty} to cart successfully`;
}, {
    name: 'addProductToCart',
    description: 'Add a product to the user cart',
    schema: z.object({
        productId: z.string().describe('ID of the product to add to cart'),
        qty: z.number().describe('Quantity of the product to add, default is 1').default(1)
    })
})

module.exports = {searchProduct, addProductToCart}