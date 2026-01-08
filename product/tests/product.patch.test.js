const { updateProduct } = require('../src/controllers/product.controller');
const productModel = require('../src/models/product.model');

jest.mock('../src/models/product.model');

describe('PATCH /api/products/:id (controller unit tests)', () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: { id: 'p1' },
      body: { title: 'Updated Title', description: 'Updated desc', priceAmount: 200 },
      user: { id: 'seller123', role: 'seller' }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    jest.clearAllMocks();
  });

  it('updates product when requester is the seller and returns 200 with updated product', async () => {
    const existing = {
      _id: 'p1',
      title: 'Old',
      description: 'old',
      price: { amount: 100, currency: 'INR' },
      seller: 'seller123',
      save: jest.fn()
    };

    // Mock findById to return existing product, and save to return updated product
    productModel.findById = jest.fn().mockResolvedValue(existing);
    existing.save.mockResolvedValue(Object.assign(existing, {
      title: req.body.title,
      description: req.body.description,
      price: { amount: Number(req.body.priceAmount), currency: existing.price.currency }
    }));

    await updateProduct(req, res);

    expect(productModel.findById).toHaveBeenCalledWith('p1');
    expect(existing.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ _id: 'p1', title: 'Updated Title' }));
  });

  it('returns 404 when product not found', async () => {
    productModel.findById = jest.fn().mockResolvedValue(null);

    await updateProduct(req, res);

    expect(productModel.findById).toHaveBeenCalledWith('p1');
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Product not found' });
  });

  it('returns 403 when requester is not the seller (forbidden)', async () => {
    const existing = {
      _id: 'p1',
      seller: 'otherSeller',
      save: jest.fn()
    };
    productModel.findById = jest.fn().mockResolvedValue(existing);

    await updateProduct(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'You are not authorized to update this product' });
  });

  it('returns 500 when save throws an error', async () => {
    const existing = {
      _id: 'p1',
      seller: 'seller123',
      save: jest.fn().mockRejectedValue(new Error('DB error'))
    };
    productModel.findById = jest.fn().mockResolvedValue(existing);

    await updateProduct(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
  });
});
