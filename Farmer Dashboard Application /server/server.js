const express = require('express');
const cookieParser = require('cookie-parser');
const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

const uri = "mongodb+srv://pc-webapp-db:farmer-db123@programming-challenge-w.ckyhzbc.mongodb.net/?appName=programming-challenge-webapp";
const client = new MongoClient(uri);

let db;

async function connectDB() {
  try {
    await client.connect();
    db = client.db('programming-challenge-webapp');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

app.use((req, res, next) => {
  req.db = db;
  next();
});

app.use('/api/auth', authRoutes);

app.get('/dashboard', authMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/login.html'));
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🌾 Farmer Portal running on http://localhost:${PORT}`);
  });
});

process.on('SIGINT', async () => {
  await client.close();
  process.exit(0);
});
