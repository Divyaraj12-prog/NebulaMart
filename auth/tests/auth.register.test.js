const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const User = require('../src/models/user.model');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  process.env.JWT_SECRET='testsecret';
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // clear users
  await User.deleteMany({});
});

test('POST /api/auth/register creates a new user', async () => {
  const payload = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'secret',
    fullname: { firstname: 'Test', lastname: 'User' }
  };

  const res = await request(app).post('/api/auth/register').send(payload).expect(201);

  expect(res.body).toHaveProperty('id');
  expect(res.body.username).toBe(payload.username);
  expect(res.body.email).toBe(payload.email);

  const userInDb = await User.findOne({ username: payload.username }).lean();
  expect(userInDb).not.toBeNull();
  expect(userInDb.email).toBe(payload.email);
});

test('POST /api/auth/register rejects missing fields', async () => {
  const payload = { username: 'noemail' };
  const res = await request(app).post('/api/auth/register').send(payload).expect(400);
  expect(res.body).toHaveProperty('message');
});

test('POST /api/auth/register rejects duplicate users', async () => {
  const payload = {
    username: 'dupuser',
    email: 'dup@example.com',
    password: 'secret',
    fullname: { firstname: 'Dup', lastname: 'User' }
  };
  await request(app).post('/api/auth/register').send(payload).expect(201);
  await request(app).post('/api/auth/register').send(payload).expect(409);
});
