const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcrypt');
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

test('POST /api/auth/login succeeds with correct credentials', async () => {
  const password = 'mypassword';
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ username: 'loginuser', email: 'login@example.com', password: hash, fullname: { firstname: 'Log', lastname: 'In' } });

  const res = await request(app).post('/api/auth/login').send({ username: 'loginuser', email: 'login@example.com', password }).expect(200);

  expect(res.body).toHaveProperty('message', 'Login successful');
  expect(res.body).toHaveProperty('username', user.username);
  expect(res.body).toHaveProperty('email', user.email);
  const cookies = res.headers['set-cookie'];
  expect(cookies).toBeDefined();
  const tokenCookie = cookies.find(c => c.startsWith('token='));
  expect(tokenCookie).toBeDefined();

  // verify token
  const token = tokenCookie.split(';')[0].split('=')[1];
  const payload = jwt.verify(token, process.env.JWT_SECRET);
  expect(payload).toHaveProperty('username', user.username);
});

test('POST /api/auth/login fails with wrong password', async () => {
  const password = 'rightpass';
  const hash = await bcrypt.hash(password, 10);
  await User.create({ username: 'badpass', email: 'bad@example.com', password: hash, fullname: { firstname: 'Bad', lastname: 'Pass' } });

  await request(app).post('/api/auth/login').send({ username: 'badpass', email: 'bad@example.com', password: 'wrongpass' }).expect(401);
});

test('POST /api/auth/login fails with missing fields', async () => {
  const res = await request(app).post('/api/auth/login').send({ username: 'nope'}).expect(400);
  expect(res.body).toHaveProperty('message');
});
