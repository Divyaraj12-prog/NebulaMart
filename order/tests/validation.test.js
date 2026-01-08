const request = require('supertest');
const express = require('express');
const bodyParser = require('express').json;
const validation = require('../src/middleware/validation.middleware');

function makeApp() {
  const app = express();
  app.use(bodyParser());

  app.post('/create', validation.createOrderValidation, (req, res) => {
    res.status(200).json({ ok: true });
  });

  app.patch('/update', validation.updateAddressValidation, (req, res) => {
    res.status(200).json({ ok: true });
  });

  return app;
}

describe('Order validation middleware', () => {
  const app = makeApp();

  test('rejects invalid create order payload', async () => {
    const res = await request(app).post('/create').send({ shippingAddress: { street: '', city: '', state: '', pincode: 'abc' } });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('errors');
  });

  test('accepts valid create order payload', async () => {
    const payload = {
      shippingAddress: {
        street: '123 St',
        city: 'TestCity',
        state: 'TS',
        pincode: '560001',
        country: 'Country'
      }
    };
    const res = await request(app).post('/create').send(payload);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  test('rejects invalid update payload', async () => {
    const res = await request(app).patch('/update').send({ shippingAddress: { pincode: '12' } });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('errors');
  });

  test('accepts valid update payload', async () => {
    const res = await request(app).patch('/update').send({ shippingAddress: { pincode: '560001' } });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});
