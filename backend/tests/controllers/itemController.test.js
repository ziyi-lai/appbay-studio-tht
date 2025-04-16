const httpMocks = require('node-mocks-http');
const itemController = require('../../src/controllers/itemController');
const { Item } = require('../../src/models');
const { logAction } = require('../../src/utils/logger');

// Mock pagination utilities
jest.mock('../../src/utils/pagination', () => ({
  getPagination: jest.fn(() => ({ limit: 10, offset: 0 })),
  getPagingData: jest.fn((data, page, limit) => ({
    rows: data.rows,
    count: data.count,
    totalPages: Math.ceil(data.count / limit),
  })),
}));

// Mock the Sequelize Item model
jest.mock('../../src/models', () => ({
  Item: {
    create: jest.fn(),
    findAndCountAll: jest.fn(),
    findOne: jest.fn(),
  },
}));


jest.mock('../../src/utils/logger', () => ({
  logAction: jest.fn(),
  LogAction: jest.fn().mockResolvedValue(true),
}));

describe('itemController', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createItem', () => {
    it('should create an item and return 201', async () => {
      const req = httpMocks.createRequest({
        method: 'POST',
        body: { name: 'Test Item', price: 100, description: 'Item description' },
      });
      const res = httpMocks.createResponse();
      const newItem = { id: 1, ...req.body };

      Item.create.mockResolvedValue(newItem);

      await itemController.createItem(req, res);

      expect(res.statusCode).toBe(201);
      expect(res._getJSONData()).toEqual(newItem);
      expect(Item.create).toHaveBeenCalledWith(req.body);
      expect(logAction).toHaveBeenCalled();
    });

    it('should return 400 when validation fails', async () => {
      const req = httpMocks.createRequest({
        method: 'POST',
        body: { price: 100 }, // missing required "name"
      });
      const res = httpMocks.createResponse();

      await itemController.createItem(req, res);

      expect(res.statusCode).toBe(400);
      expect(res._getJSONData().error).toBeDefined();
    });
  });

  describe('getAllItems', () => {
    it('should return paginated items', async () => {
      const itemsData = {
        rows: [{ id: 1, name: "Item 1", price: 50 }],
        count: 1,
      };
      Item.findAndCountAll.mockResolvedValue(itemsData);

      const req = httpMocks.createRequest({
        method: 'GET',
        query: { page: 1, limit: 10 },
      });
      const res = httpMocks.createResponse();

      await itemController.getAllItems(req, res);

      expect(Item.findAndCountAll).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
        order: [['id', 'ASC']],
      });
      const responseData = res._getJSONData();
      expect(responseData.rows).toEqual(itemsData.rows);
      expect(responseData.totalPages).toBe(1);
    });
  });

  describe('getItemById', () => {
    it('should return item when found', async () => {
      const testItem = { id: 1, name: 'Test Item', price: 100 };
      const req = httpMocks.createRequest({ params: { id: 1 } });
      const res = httpMocks.createResponse();
      Item.findOne.mockResolvedValue(testItem);

      await itemController.getItemById(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(testItem);
      expect(Item.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should return 404 if item not found', async () => {
      const req = httpMocks.createRequest({ params: { id: 999 } });
      const res = httpMocks.createResponse();
      Item.findOne.mockResolvedValue(null);

      await itemController.getItemById(req, res);

      expect(res.statusCode).toBe(404);
      expect(res._getJSONData()).toEqual({ error: 'Item not found.' });
    });
  });

  describe('updateItem', () => {
    it('should update an existing item', async () => {
      const oldItem = {
        id: 1,
        name: 'Old Item',
        price: 50,
        toJSON: function () {
          return { id: this.id, name: this.name, price: this.price };
        },
        update: jest.fn().mockImplementation(function (newData) {
          Object.assign(this, newData);
          return Promise.resolve(this);
        })
      };
      const updateData = { name: 'Updated Item', price: 75 };
      const req = httpMocks.createRequest({
        method: 'PUT',
        params: { id: 1 },
        body: updateData,
      });
      const res = httpMocks.createResponse();
      Item.findOne.mockResolvedValue(oldItem);

      await itemController.updateItem(req, res);

      expect(Item.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(oldItem.update).toHaveBeenCalledWith(updateData);
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({ id: 1, name: 'Updated Item', price: 75 });
      expect(logAction).toHaveBeenCalled();
    });

    it('should return 404 if item not found for update', async () => {
      const req = httpMocks.createRequest({
        method: 'PUT',
        params: { id: 999 },
        body: { name: 'Updated' },
      });
      const res = httpMocks.createResponse();
      Item.findOne.mockResolvedValue(null);

      await itemController.updateItem(req, res);

      expect(res.statusCode).toBe(404);
      expect(res._getJSONData()).toEqual({ error: 'Item not found.' });
    });
  });

  describe('deleteItem', () => {
    it('should delete the item and return success message', async () => {
      const testItem = {
        id: 1,
        destroy: jest.fn().mockResolvedValue(),
      };
      const req = httpMocks.createRequest({
        method: 'DELETE',
        params: { id: 1 },
      });
      const res = httpMocks.createResponse();
      Item.findOne.mockResolvedValue(testItem);

      await itemController.deleteItem(req, res);

      expect(testItem.destroy).toHaveBeenCalled();
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({ message: 'Item deleted successfully' });
      expect(logAction).toHaveBeenCalled();
    });

    it('should return 404 if item not found for deletion', async () => {
      const req = httpMocks.createRequest({
        method: 'DELETE',
        params: { id: 999 },
      });
      const res = httpMocks.createResponse();
      Item.findOne.mockResolvedValue(null);

      await itemController.deleteItem(req, res);

      expect(res.statusCode).toBe(404);
      expect(res._getJSONData()).toEqual({ error: 'Item not found' });
    });
  });
});
