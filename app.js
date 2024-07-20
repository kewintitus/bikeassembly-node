const cookieParser = require('cookie-parser');
const cors = require('cors');
const viewRouter = require('./routes/viewRoute');
const authRouter = require('./routes/authRoute');
const bikeTypeRouter = require('./routes/bikeTypeRoute');
const express = require('express');

const app = express();
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);
app.use(cookieParser());

app.use(express.json({ limit: '10kb' }));

app.use('/api/v1/', viewRouter);
app.use('/api/v1/', authRouter);
app.use('/api/v1/', bikeTypeRouter);

app.all('*', (req, res, next) => {
  res.status(404).json({
    status: 'FAILED',
    message: 'Cannot find the route',
  });
});

module.exports = app;
