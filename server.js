const dotenv = require('dotenv');

dotenv.config();
const express = require('express');

const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const logger = require('morgan');

const PORT = process.env.PORT || 3000;

// Controllers
const testJwtRouter = require('./controllers/test-jwt');
const authCtrl = require('./controllers/auth');
const usersCtrl = require('./controllers/users');
const accountCtrl = require('./controllers/account');
const transactionCtrl = require('./controllers/transaction');
const budgetCtrl = require('./controllers/budget');

// MiddleWare
const verifyToken = require('./middleware/verify-token');

mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on('connected', () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

app.use(cors());
app.use(express.json());
app.use(logger('dev'));

// Public
app.use('/auth', authCtrl);
app.use('/test-jwt', testJwtRouter);

// Protected Routes
app.use(verifyToken);
app.use('/users', usersCtrl);
app.use('/api/accounts', accountCtrl);
app.use('/api/transactions', transactionCtrl);
app.use('/api/budgets', budgetCtrl);

app.listen(PORT, () => {
  console.log('The express app is ready!');
});