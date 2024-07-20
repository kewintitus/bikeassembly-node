const dotenv = require('dotenv');
const app = require('./app');
const mongoose = require('mongoose');

dotenv.config({ path: './config.env' });

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION: SHUTTING DOWN!!!');
  console.log(err.name, err.message);

  process.exit(1);
});

const connectionString =
  'mongodb+srv://kewintitus:9UJbHVcxSGxm6RiX@cluster0.q82uepz.mongodb.net/manufacturing';

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`app running on port ${port}`);
});

mongoose
  .connect(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected successfully to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION: SHUTTING DOWN!!!');
  server.close(() => {
    process.exit(1);
  });
});
