const httpMocks = require('node-mocks-http');
const userController = require('../../src/controllers/userController');
const { User } = require('../../src/models');
const { logAction } = require('../../src/utils/logger');


jest.mock('../../src/utils/pagination', () => ({
  getPagination: jest.fn(() => ({ limit: 10, offset: 0 })),
  getPagingData: jest.fn((data, page, limit) => ({
    rows: data.rows,
    count: data.count,
    totalPages: Math.ceil(data.count / limit),
  })),
}));

jest.mock('../../src/models', () => ({
  User: {
    create: jest.fn(),
    findAndCountAll: jest.fn(),
    findOne: jest.fn(),
  },
}));

jest.mock('../../src/utils/logger', () => ({
  logAction: jest.fn(),
}));

describe('userController', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a user and return 201', async () => {
      const req = httpMocks.createRequest({
        method: 'POST',
        body: { name: 'Test User', email: 'test@example.com', role: 'admin' },
      });
      const res = httpMocks.createResponse();
      const newUser = { id: 1, ...req.body };

      User.create.mockResolvedValue(newUser);

      await userController.createUser(req, res);

      expect(res.statusCode).toBe(201);
      expect(res._getJSONData()).toEqual(newUser);
      expect(User.create).toHaveBeenCalledWith(req.body);
      expect(logAction).toHaveBeenCalled();
    });

    it('should return 400 if validation fails', async () => {
      const req = httpMocks.createRequest({
        method: 'POST',
        body: { email: 'invalid-email', role: 'admin' }, // missing name, invalid email
      });
      const res = httpMocks.createResponse();

      await userController.createUser(req, res);

      expect(res.statusCode).toBe(400);
      const data = res._getJSONData();
      expect(data.error).toBeDefined();
    });
  });

  describe('getAllUsers', () => {
    it('should return paginated users', async () => {
      const usersData = {
        rows: [{ id: 1, name: "User 1", email: "user1@example.com", role: "admin" }],
        count: 1,
      };
      User.findAndCountAll.mockResolvedValue(usersData);

      const req = httpMocks.createRequest({
        method: 'GET',
        query: { page: 1, limit: 10 },
      });
      const res = httpMocks.createResponse();

      await userController.getAllUsers(req, res);

      expect(User.findAndCountAll).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
        order: [['id', 'ASC']],
      });
      const responseData = res._getJSONData();
      expect(responseData.rows).toEqual(usersData.rows);
      expect(responseData.totalPages).toBe(1);
    });
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      const testUser = { id: 1, name: 'Test User', email: 'test@example.com', role: 'admin' };
      const req = httpMocks.createRequest({ params: { id: 1 } });
      const res = httpMocks.createResponse();
      User.findOne.mockResolvedValue(testUser);

      await userController.getUserById(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(testUser);
      expect(User.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should return 404 if user not found', async () => {
      const req = httpMocks.createRequest({ params: { id: 999 } });
      const res = httpMocks.createResponse();
      User.findOne.mockResolvedValue(null);

      await userController.getUserById(req, res);

      expect(res.statusCode).toBe(404);
      expect(res._getJSONData()).toEqual({ error: 'User not found.' });
    });
  });

  describe('updateUser', () => {
    it('should update an existing user', async () => {
      const oldUser = {
        id: 1,
        name: 'Old User',
        email: 'old@example.com',
        role: 'admin',
        toJSON: function () {
          return { id: this.id, name: this.name, email: this.email, role: this.role };
        },
        update: jest.fn().mockImplementation(function (newData) {
          Object.assign(this, newData);
          return Promise.resolve(this);
        })
      };
      const updateData = { name: 'Updated User', email: 'updated@example.com' };
      const req = httpMocks.createRequest({
        method: 'PUT',
        params: { id: 1 },
        body: updateData,
      });
      const res = httpMocks.createResponse();
      User.findOne.mockResolvedValue(oldUser);

      await userController.updateUser(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(oldUser.update).toHaveBeenCalledWith(updateData);
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({
        id: 1,
        name: 'Updated User',
        email: 'updated@example.com',
        role: 'admin',
      });
      expect(logAction).toHaveBeenCalled();
    });

    it('should return 404 if user not found for update', async () => {
      const req = httpMocks.createRequest({
        method: 'PUT',
        params: { id: 999 },
        body: { name: 'Updated' },
      });
      const res = httpMocks.createResponse();
      User.findOne.mockResolvedValue(null);

      await userController.updateUser(req, res);

      expect(res.statusCode).toBe(404);
      expect(res._getJSONData()).toEqual({ error: 'User not found.' });
    });
  });

  describe('deleteUser', () => {
    it('should delete the user and return success message', async () => {
      const testUser = {
        id: 1,
        destroy: jest.fn().mockResolvedValue(),
      };
      const req = httpMocks.createRequest({
        method: 'DELETE',
        params: { id: 1 },
      });
      const res = httpMocks.createResponse();
      User.findOne.mockResolvedValue(testUser);

      await userController.deleteUser(req, res);

      expect(testUser.destroy).toHaveBeenCalled();
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({ message: 'User deleted successfully' });
      expect(logAction).toHaveBeenCalled();
    });

    it('should return 404 if user not found for deletion', async () => {
      const req = httpMocks.createRequest({
        method: 'DELETE',
        params: { id: 999 },
      });
      const res = httpMocks.createResponse();
      User.findOne.mockResolvedValue(null);

      await userController.deleteUser(req, res);

      expect(res.statusCode).toBe(404);
      expect(res._getJSONData()).toEqual({ error: 'User not found' });
    });
  });
});
