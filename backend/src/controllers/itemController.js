const { Item, Log } = require('../models');
const { logAction } = require('../utils/logger');
const { getPagination, getPagingData } = require('../utils/pagination');
const { z } = require('zod');

// TODO: Unified error message or system message

// Schema to create item
const itemSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  description: z.string().optional(),
  price: z.number(),
});

// Schema to partially update item
const partialItemSchema = itemSchema.partial();

// Create Item
exports.createItem = async (req, res) => {
  try {
    const validatedData = itemSchema.parse(req.body);
    const newItem = await Item.create(validatedData);
    await logAction('create', Item.name, { newItem: newItem });
    return res.status(201).json(newItem);
  }
  catch (error) {
    return res.status(400).json({ error: error.errors || error.message });
  }
};

// Get all Item(s)
exports.getAllItems = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const { limit: effectiveLimit, offset } = getPagination(page, limit);

    const data = await Item.findAndCountAll({
      limit: effectiveLimit,
      offset,
      order: [['id', 'ASC']],
    });

    const response = getPagingData(data, page, limit);
    return res.json(response);
  }
  catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get specific Item by ID
exports.getItemById = async (req, res) => {
  try {
    const item = await Item.findOne({ where: { id: req.params.id } });
    if (!item) {
      return res.status(404).json({ error: 'Item not found.' });
    }
    return res.json(item);
  }
  catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Update Item
exports.updateItem = async (req, res) => {
  try {
    const validatedData = partialItemSchema.parse(req.body);
    const item = await Item.findOne({ where: { id: req.params.id } });
    if (!item) {
      return res.status(404).json({ error: 'Item not found.' });
    }
    const oldData = item.toJSON();
    await item.update(validatedData);
    await LogAction('update', 'Item', { before: oldData, after: item });
    return res.json(item);
  }
  catch (error) {
    return res.status(400).json({ error: error.errors || error.message });
  }
};

// Delete Item
exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findOne({ where: { id: req.params.id } });
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    await LogAction('delete', 'Item', { deleted: item });
    await item.destroy();
    return res.json({ message: 'Item deleted successfully' });
  }
  catch (error) {
    return res.status(500).json({ error: error.message });
  }
};





