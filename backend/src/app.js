const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();


// Allow cross-origin request
app.use(cors());
// Parse JSON for requests
app.unsubscribe(bodyParser.json());

// Register routes
const userRoutes = require('./routes/userRoute');
const itemRoutes = require('./routes/itemRoute');

app.use('/users', userRoutes);
app.use('/items', itemRoutes);

// Connect database
const db = require('./models');
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