const request = require('supertest');
const app = require('../src/app');

jest.mock('../src/models/product.model', () => ({
  find: jest.fn().mockImplementation(() => ({
    skip: function () { return this; },
    limit: function () { return Promise.resolve([
      {
        _id: 'p1',
        title: 'Prod1',
        description: 'desc',
        price: { amount: 100, currency: 'INR' },
        seller: 'seller1',
        image: [{ url: 'https://cdn.example/test.jpg', thumbnail: 'https://cdn.example/thumb.jpg', id: 'file123' }]
      }
    ]); }
  }))
}));
let env = process.env;

describe('GET /api/products', () => {
  it('returns list of products', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0]).toHaveProperty('title', 'Prod1');
  });
});
