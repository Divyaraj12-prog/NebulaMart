const request = require('supertest');
const express = require('express');
const bodyParser = require('express').json;
const validation = require('../src/middleware/validation.middleware');

function makeApp() {
  const app = express();
  app.use(bodyParser());

  app.post('/test-add', validation.validateAddItemToCart, (req, res) => {
    res.status(200).json({ ok: true });
  });

  app.patch('/test-update/:productId', validation.validateUpdatecartItem, (req, res) => {
    res.status(200).json({ ok: true });
  });

  return app;
}

describe('Validation middleware', () => {
  const app = makeApp();

  test('rejects invalid add item payload', async () => {
    const res = await request(app).post('/test-add').send({ productId: 'not-an-id', qty: -1 });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('errors');
  });

  test('accepts valid add item payload', async () => {
    const validProductId = '507f1f77bcf86cd799439011';
    const res = await request(app).post('/test-add').send({ productId: validProductId, qty: 2 });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  test('rejects invalid update param and body', async () => {
    const res = await request(app).patch('/test-update/not-an-id').send({ qty: 0 });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('errors');
  });

  test('accepts valid update param and body', async () => {
    const validProductId = '507f1f77bcf86cd799439011';
    const res = await request(app).patch(`/test-update/${validProductId}`).send({ qty: 3 });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});
