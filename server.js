require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

// handle unexpected crashes gracefully instead of a silent process death
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! Shutting down...', err);
  process.exit(1);
});

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Digital Wallet API running on port ${PORT} [${process.env.NODE_ENV}]`);
  });
};

start();
