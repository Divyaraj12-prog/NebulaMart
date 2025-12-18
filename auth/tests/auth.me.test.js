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

test('GET /api/auth/me returns user info when authenticated', async () => {
  const user = await User.create({
    username: 'meuser',
    email: 'me@example.com',
    password: 'irrelevant',
    fullname: { firstname: 'Me', lastname: 'User' }
  });

  const token = jwt.sign({ id: user._id, username: user.username, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' });

  const res = await request(app)
    .get('/api/auth/me')
    .set('Cookie', `token=${token}`)
    .expect(200);

  expect(res.body.user).toHaveProperty('username', user.username);
  expect(res.body.user).toHaveProperty('email', user.email);
});

test('GET /api/auth/me returns 401 when no auth cookie provided', async () => {
  await request(app).get('/api/auth/me').expect(401);
});

test('GET /api/auth/me returns 401 for invalid token', async () => {
  const badToken = jwt.sign({ id: '000000000000000000000000' }, 'wrongsecret');
  await request(app).get('/api/auth/me').set('Cookie', `token=${badToken}`).expect(401);
});
