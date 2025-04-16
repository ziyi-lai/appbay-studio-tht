const request = require('supertest');
const express = require('express');
const itemRoute = require('../../src/routes/itemRoute');


jest.mock('../../src/controllers/itemController', () => ({
  createItem: jest.fn((req, res) => res.status(201).json({ id: 1, ...req.body })),
  getAllItems: jest.fn((req, res) => res.json({ rows: [], count: 0 })),
  getItemById: jest.fn((req, res) =>
    res.json({ id: parseInt(req.params.id), name: 'Mocked Item', price: 100 })
  ),
  updateItem: jest.fn((req, res) =>
    res.json({ id: parseInt(req.params.id), ...req.body })
  ),
  deleteItem: jest.fn((req, res) => res.json({ message: 'Item deleted successfully' })),
}));


const app = express();
app.use(express.json());
app.use('/items', itemRoute);

describe('Item Routes', () => {
  it('POST /items => create new item', async () => {
    const newItem = { name: 'New Item', price: 123 };
    const res = await request(app).post('/items').send(newItem);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject(newItem);
  });

  it('GET /items => returns list of items', async () => {
    const res = await request(app).get('/items');
    expect(res.status).toBe(200);
    expect(res.body.rows).toBeInstanceOf(Array);
  });

  it('GET /items/:id => returns item details', async () => {
    const res = await request(app).get('/items/10');
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(10);
    expect(res.body.name).toBe('Mocked Item');
  });

  it('PUT /items/:id => updates an item', async () => {
    const updateData = { name: 'Updated Item', price: 999 };
    const res = await request(app).put('/items/5').send(updateData);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: 5, ...updateData });
  });

  it('DELETE /items/:id => deletes an item', async () => {
    const res = await request(app).delete('/items/5');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Item deleted successfully');
  });
});
