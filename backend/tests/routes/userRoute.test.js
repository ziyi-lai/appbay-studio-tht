const request = require('supertest');
const express = require('express');
const userRoute = require('../../src/routes/userRoute');

jest.mock('../../src/controllers/userController', () => ({
  createUser: jest.fn((req, res) => res.status(201).json({ id: 1, ...req.body })),
  getAllUsers: jest.fn((req, res) => res.json({ rows: [], count: 0 })),
  getUserById: jest.fn((req, res) =>
    res.json({ id: parseInt(req.params.id), name: 'Mocked User', email: 'test@example.com' })
  ),
  updateUser: jest.fn((req, res) =>
    res.json({ id: parseInt(req.params.id), ...req.body })
  ),
  deleteUser: jest.fn((req, res) => res.json({ message: 'User deleted successfully' })),
}));

const app = express();
app.use(express.json());
app.use('/users', userRoute);

describe('User Routes', () => {
  it('POST /users => creates a user', async () => {
    const newUser = { name: 'New User', email: 'user@example.com', role: 'admin' };
    const res = await request(app).post('/users').send(newUser);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject(newUser);
  });

  it('GET /users => returns list of users', async () => {
    const res = await request(app).get('/users');
    expect(res.status).toBe(200);
    expect(res.body.rows).toBeInstanceOf(Array);
  });

  it('GET /users/:id => returns user details', async () => {
    const res = await request(app).get('/users/10');
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(10);
    expect(res.body.name).toBe('Mocked User');
  });

  it('PUT /users/:id => updates a user', async () => {
    const updateData = { name: 'Updated User', email: 'updated@example.com' };
    const res = await request(app).put('/users/5').send(updateData);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: 5, ...updateData });
  });

  it('DELETE /users/:id => deletes a user', async () => {
    const res = await request(app).delete('/users/5');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('User deleted successfully');
  });
});
