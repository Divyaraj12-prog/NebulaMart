const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const User = require('../src/models/user.model');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  process.env.JWT_SECRET = 'testsecret';
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
});

test('GET /api/auth/logout clears cookie and returns success', async () => {
  const user = await User.create({ username: 'logoutuser', email: 'logout@example.com', password: 'irrelevant', fullname: { firstname: 'Out', lastname: 'User' } });
  const token = jwt.sign({ id: user._id, username: user.username, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' });

  const res = await request(app)
    .get('/api/auth/logout')
    .set('Cookie', `token=${token}`)
    .expect(200);

  expect(res.body).toHaveProperty('message');
  const cookies = res.headers['set-cookie'];
  expect(cookies).toBeDefined();
  const tokenCookie = cookies.find(c => c.startsWith('token='));
  expect(tokenCookie).toBeDefined();
  // cookie should be cleared (either empty value or immediate expiry)
  expect(/(^token=;)|((Max-Age=0)|(Expires=Thu, 01 Jan 1970))/i.test(tokenCookie)).toBe(true);
});

test('GET /api/auth/logout returns 401 when no auth cookie provided', async () => {
  await request(app).get('/api/auth/logout').expect(401);
});

test('GET /api/auth/logout returns 401 for invalid token', async () => {
  const badToken = jwt.sign({ id: '000000000000000000000000' }, 'wrongsecret');
  await request(app).get('/api/auth/logout').set('Cookie', `token=${badToken}`).expect(401);
});
