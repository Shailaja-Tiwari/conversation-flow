require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');

const app = express();
app.use(express.json());

connectDB();

app.use('/modules', require('./routes/modules'));
app.use('/users', require('./routes/users'));
app.use('/answer', require('./routes/answer'));
app.use('/go-back', require('./routes/goBack'));

// Only start server if run directly (not during testing)
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
