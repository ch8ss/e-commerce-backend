const express = require('express');
const mongoose = require('mongoose');
const mysql = require('mysql2/promise');
const cors = require('cors')
require('dotenv').config();

const productRoutes = require('./routes/products');
const userRoutes = require('./routes/users');
const orderRoutes = require('./routes/orders');

const app = express();
app.use(cors());
app.use(express.json());

//mongodb connection (products)
mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((err) => {
  console.error('Error connecting to MongoDB:', err);
});

//mysql connection (users, orders)
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  connectionLimit: 10,
});

app.locals.db = pool; 
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);

application.get('/', (req, res) => res.json({status: 'API is running'}));

app.listen(process.env.PORT || 3000,
    () => console.log('Server on port ${process.env.PORT || 3000}'));
    