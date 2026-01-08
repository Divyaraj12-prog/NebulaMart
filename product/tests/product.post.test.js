const request = require('supertest');
const app = require('../src/app');

jest.mock('../src/models/product.model', () => ({
  create: jest.fn().mockImplementation((payload) => Promise.resolve(Object.assign({ _id: 'mockedId' }, payload)))
}));

jest.mock('../src/services/imagekit.client', () => ({
  uploadFile: jest.fn().mockResolvedValue({ url: 'https://cdn.example/test.jpg', fileId: 'file123', thumbnail: 'https://cdn.example/thumb.jpg' })
}));

// Mock auth middleware to shortcut authentication in tests
jest.mock('../src/middleware/auth.middleware', () => {
  return () => (req, res, next) => {
    req.user = { _id: 'sellerId', role: 'seller' };
    next();
  };
});

describe('POST /api/products', () => {
  it('creates a product and uploads images', async () => {
    const res = await request(app)
      .post('/api/products')
      .field('title', 'Test Product')
      .field('description', 'A product for testing')
      .field('priceAmount', '100')
      .attach('images', Buffer.from('fake image'), 'test.jpg');

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('_id', 'mockedId');
    expect(res.body).toHaveProperty('title', 'Test Product');
    expect(res.body.image).toBeDefined();
    expect(res.body.image.length).toBeGreaterThan(0);
    expect(res.body.image[0].url).toBe('https://cdn.example/test.jpg');
  });
});
