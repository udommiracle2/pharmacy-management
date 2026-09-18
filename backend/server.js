const path = require('path');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const medicineRoutes = require('./routes/medicineRoutes');
const saleRoutes = require('./routes/saleRoutes');
const reportRoutes = require('./routes/reportRoutes');

connectDB();

const app = express();

// app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));


const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_ORIGIN,
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

app.use(express.json());

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

app.use(express.json());
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.get('/api/health', (req, res) => res.json({ success: true, message: 'Pharmacy API is running' }));

app.use('/api/auth', authRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/reports', reportRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
