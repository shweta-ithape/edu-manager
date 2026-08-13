const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

const app = express();

// Connect Database
connectDB();

// Basic security rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per windowMs
  message: { success: false, message: 'Too many requests from this IP, please try again later.' }
});

app.use(limiter);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/trainers', require('./routes/trainerRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/batches', require('./routes/batchRoutes'));
app.use('/api/enrollments', require('./routes/enrollmentRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/fees', require('./routes/feeRoutes'));
app.use('/api/results', require('./routes/resultRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Training Institute API is operational' });
});

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'API Route not found' });
});

// Centralized Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[Server] Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
