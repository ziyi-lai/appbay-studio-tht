const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// Register routes
const userRouter = require('./src/routes/userRoute');
const itemRouter = require('./src/routes/itemRoute');

const app = express();


// Allow cross-origin request
app.use(cors());
// Parse JSON for requests
app.use(bodyParser.json());

app.use('/users', userRouter);
app.use('/items', itemRouter);

// Connect database
const db = require('./src/models');
db.sequelize.sync()
  .then(() => {
    console.log('Database synced.')
  })
  .catch((error) => {
    console.error('Error syncing database:', error);
  });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});