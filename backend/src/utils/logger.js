const { Log } = require('../models');

const logAction = async (action, model, details) => {
  try {
    await Log.create({
      action,
      model,
      details,
      timestamp: new Date(),
    });
  } catch (err) {
    console.error('Error logging action:', err);
  }
};

module.exports = { logAction };