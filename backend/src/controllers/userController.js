const { User } = require('../models');
const { USER_ROLES } = require('../enum/role');
const { logAction } = require('../utils/logger');
const { getPagination, getPagingData } = require('../utils/pagination');
const { z } = require('zod');
const { LOG_ACTION } = require('../enum/action');


// Schema to create user
const userSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required.')
    .refine(value => /^[A-Za-z\s0-9]+$/.test(value), {
      message: 'Name must contain only letters, numbers, and spaces.',
    }),
  email: z.string().email('Invalid email format.'),
  role: z.enum(Object.values(USER_ROLES)),
});

// Schema to partially update user
const partialUserSchema = userSchema.partial();

// Create User
exports.createUser = async (req, res) => {
  try {
    const validatedData = userSchema.parse(req.body);
    const newUser = await User.create(validatedData);
    await logAction(LOG_ACTION.CREATE, User.name, { newUser });
    return res.status(201).json(newUser);
  }
  catch (error) {
    return res.status(400).json({ error: error.errors || error.message });
  }
};

// Get all User(s)
exports.getAllUsers = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const { limit: effectiveLimit, offset } = getPagination(page, limit);

    const data = await User.findAndCountAll({
      limit: effectiveLimit,
      offset,
      order: [['id', 'ASC']],
    });

    const response = getPagingData(data, page, limit);
    return res.json(response);
  }
  catch (error) {
    return res.status(500).json({ error: error.messsage });
  }
};



// Get specific User by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findOne({ where: { id: req.params.id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    return res.json(user);
  }
  catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Update User
exports.updateUser = async (req, res) => {
  try {
    const validatedData = partialUserSchema.parse(req.body);
    const user = await User.findOne({ where: { id: req.params.id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    const oldData = user.toJSON();
    await user.update(validatedData);
    await logAction(LOG_ACTION.UPDATE, 'User', { before: oldData, after: user });
    return res.json(user);
  }
  catch (error) {
    return res.status(400).json({ error: error.errors || error.message });
  }
};

// Delete User
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findOne({ where: { id: req.params.id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    await logAction(LOG_ACTION.DELETE, 'User', { deleted: user });
    await user.destroy();
    return res.json({ message: 'User deleted successfully' });
  }
  catch (error) {
    return res.status(500).json({ error: error.message });
  }
};





