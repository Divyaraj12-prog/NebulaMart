const request = require('supertest');
const app = require('../src/app');

jest.mock('../src/models/product.model', () => ({
  findById: jest.fn()
}));

const productModel = require('../src/models/product.model');

describe('GET /api/products/:id', () => {
  it('returns a product when found', async () => {
    productModel.findById.mockResolvedValue({
      _id: 'p1',
      title: 'Prod1',
      description: 'desc',
      price: { amount: 100, currency: 'INR' },
    });

    const res = await request(app).get('/api/products/p1');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('_id', 'p1');
    expect(res.body).toHaveProperty('title', 'Prod1');
  });

  it('returns 404 when product not found', async () => {
    productModel.findById.mockResolvedValue(null);

    const res = await request(app).get('/api/products/unknown');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message', 'Product not found');
  });
});
