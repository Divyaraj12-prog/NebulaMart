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

test('GET /api/auth/users/me/addresses returns saved addresses and default flag', async () => {
  const user = await User.create({
    username: 'addruser',
    email: 'addr@example.com',
    password: 'irrelevant',
    fullname: { firstname: 'Addr', lastname: 'User' },
    addressSchema: [
      { street: '1 A St', city: 'X', state: 'S', zip: '11111', country: 'C', isDefault: true },
      { street: '2 B St', city: 'Y', state: 'S', zip: '22222', country: 'C', isDefault: false }
    ]
  });

  const token = jwt.sign({ id: user._id, username: user.username, email: user.email }, process.env.JWT_SECRET);

  const res = await request(app)
    .get('/api/auth/users/me/addresses')
    .set('Cookie', `token=${token}`)
    .expect(200);

  expect(res.body).toHaveProperty('addresses');
  expect(Array.isArray(res.body.addresses)).toBe(true);
  expect(res.body.addresses.length).toBe(2);
  const defaults = res.body.addresses.filter(a => a.isDefault);
  expect(defaults.length).toBeGreaterThanOrEqual(1);
});

test('POST /api/auth/users/me/addresses adds an address with valid pincode and phone', async () => {
  const user = await User.create({ username: 'adduser', email: 'add@example.com', password: 'irrelevant', fullname: { firstname: 'Add', lastname: 'User' } });
  const token = jwt.sign({ id: user._id, username: user.username, email: user.email }, process.env.JWT_SECRET);

  const payload = {
    street: '100 Main St',
    city: 'Townsville',
    state: 'TS',
    zip: '560001',
    country: 'Country',
    pincode: '560001',
    phone: '9876543210',
    isDefault: true
  };

  const res = await request(app)
    .post('/api/auth/users/me/addresses')
    .set('Cookie', `token=${token}`)
    .send(payload)
    .expect(201);

  expect(res.body).toHaveProperty('address');
  expect(res.body.address).toHaveProperty('street', payload.street);
});

test('POST /api/auth/users/me/addresses rejects invalid pincode/phone', async () => {
  const user = await User.create({ username: 'valuser', email: 'val@example.com', password: 'irrelevant', fullname: { firstname: 'Val', lastname: 'User' } });
  const token = jwt.sign({ id: user._id, username: user.username, email: user.email }, process.env.JWT_SECRET);

  const badPayloads = [
    { street: 'X', city: 'C', state: 'S', zip: '1', country: 'C', pincode: '123', phone: '9876543210' }, // bad pincode
    { street: 'Y', city: 'C', state: 'S', zip: '2', country: 'C', pincode: '560001', phone: '12345' }  // bad phone
    
  ];

  for (const payload of badPayloads) {
    const res = await request(app)
      .post('/api/auth/users/me/addresses')
      .set('Cookie', `token=${token}`)
      .send(payload)
      .expect(400);

    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('errors');
  }
});

test('DELETE /api/auth/users/me/addresses/:addressId removes the address', async () => {
  const user = await User.create({
    username: 'deluser',
    email: 'del@example.com',
    password: 'irrelevant',
    fullname: { firstname: 'Del', lastname: 'User' },
    addressSchema: [ { street: 'ToRemove', city: 'C', state: 'S', zip: '000', country: 'C' } ]
  });

  // get the address id from the saved user
  const saved = await User.findById(user._id).lean();
  const addressId = saved.addressSchema[0]._id.toString();

  const token = jwt.sign({ id: user._id, username: user.username, email: user.email }, process.env.JWT_SECRET);

  await request(app)
    .delete(`/api/auth/users/me/addresses/${addressId}`)
    .set('Cookie', `token=${token}`)
    .expect(200);

  const after = await User.findById(user._id).lean();
  expect(after.addressSchema.length).toBe(0);
});
