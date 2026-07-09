const sequelize = require('./database');

/**
 * Just verifies we can actually reach MySQL before the server starts
 * accepting traffic. Schema creation is handled entirely by migrations
 * (npx sequelize-cli db:migrate), not by sequelize.sync(), so that
 * DBeaver and the app always agree on what the schema looks like.
 */
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`MySQL connected: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
  } catch (err) {
    console.error('Failed to connect to MySQL:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
