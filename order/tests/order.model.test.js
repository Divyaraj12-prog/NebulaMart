const mongoose = require('mongoose');
const Order = require('../src/models/order.model');

describe('Order model', () => {
  test('creates and retrieves an order document', async () => {
    const userId = new mongoose.Types.ObjectId();
    const productId = new mongoose.Types.ObjectId();

    const order = await Order.create({
      user: userId,
      items: [{ product: productId, quantity: 2, price: { amount: 100, currency: 'USD' } }],
      status: 'PENDING',
      totalPrice: { amount: 200, currency: 'USD' },
      shippingAddress: { street: '123 St', city: 'City', state: 'ST', zip: '123456', pincode: '123456', country: 'Country' }
    });

    expect(order).toBeDefined();
    expect(order.user.toString()).toBe(userId.toString());
    expect(order.items).toHaveLength(1);
    expect(order.items[0].product.toString()).toBe(productId.toString());
    expect(order.items[0].quantity).toBe(2);
    expect(order.totalPrice.amount).toBe(200);
  });

  test('enforces quantity minimum for items', async () => {
    const userId = new mongoose.Types.ObjectId();
    const productId = new mongoose.Types.ObjectId();

    await expect(Order.create({
      user: userId,
      items: [{ product: productId, quantity: 0, price: { amount: 10, currency: 'USD' } }],
      totalPrice: { amount: 0, currency: 'USD' },
      shippingAddress: { street: '123', city: 'C', state: 'S', zip: '123456', pincode: '123456', country: 'X' }
    })).rejects.toThrow();
  });
});
