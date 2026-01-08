const mongoose = require('mongoose');
const Cart = require('../src/models/cart.model');

describe('Cart model', () => {
  test('creates and retrieves a cart document', async () => {
    const userId = new mongoose.Types.ObjectId();
    const productId = new mongoose.Types.ObjectId();

    const cart = await Cart.create({ user: userId, items: [{ productId, quantity: 2 }] });

    expect(cart).toBeDefined();
    expect(cart.user.toString()).toBe(userId.toString());
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].productId.toString()).toBe(productId.toString());
    expect(cart.items[0].quantity).toBe(2);
  });

  test('enforces quantity minimum', async () => {
    const userId = new mongoose.Types.ObjectId();
    const productId = new mongoose.Types.ObjectId();

    await expect(Cart.create({ user: userId, items: [{ productId, quantity: 0 }] })).rejects.toThrow();
  });
});
