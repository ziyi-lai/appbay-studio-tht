const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// Register routes
const userRouter = require('./src/routes/userRoute');
const itemRouter = require('./src/routes/itemRoute');

// Initialize app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Mount routes
app.use('/users', userRouter);
app.use('/items', itemRouter);

// Test root route
app.get('/', (req, res) => {
  res.send('Server is running and connected to database.');
});

// Connect database
const db = require('./src/models');
const PORT = process.env.PORT || 5000;

db.sequelize.sync()
  .then(() => {
    console.log('Database synced.')

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}.`);
    });
  })
  .catch((error) => {
    console.error('Error syncing database:', error);
  });

// Detect if Node.js is killed
process.on('exit', (code) => {
  console.log(`Node process exiting with code ${code}`);
});

process.on('SIGINT', () => {
  console.log('Caught SIGINT (e.g., Ctrl+C). Exiting...');
  process.exit();
});
