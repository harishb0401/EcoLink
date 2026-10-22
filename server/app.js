import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

// Routes
import authRoutes from './routes/authRoutes.js';
import wasteRoutes from './routes/wasteRoutes.js';
import offerRoutes from './routes/offerRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import recyclerRoutes from './routes/recyclerRoutes.js';
import pricingRoutes from './routes/pricingRoutes.js';

// Middleware & Supabase Config
import { errorMiddleware, notFoundMiddleware } from './middleware/errorMiddleware.js';
import { isSupabaseConfigured, checkSupabaseConnection } from './config/supabase.js';

const app = express();

// Security headers
app.use(helmet());

// CORS Configuration
const configuredClientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      // or origins matching CLIENT_URL and standard development localhost ports (3000, 3001, 5173)
      if (
        !origin ||
        origin === configuredClientUrl ||
        origin === 'http://localhost:3000' ||
        origin === 'http://127.0.0.1:3000' ||
        origin === 'http://localhost:3001' ||
        origin === 'http://127.0.0.1:3001' ||
        origin === 'http://localhost:5173' ||
        origin === 'http://127.0.0.1:5173'
      ) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked request from unauthorized origin: ${origin}`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Body Parsers
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// General Rate Limiter (500 requests per 15 minutes)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests created from this IP, please try again after 15 minutes'
  }
});
app.use('/api', globalLimiter);

// 1. Health Check Endpoint
app.get('/api/health', async (req, res) => {
  const isConfigured = isSupabaseConfigured();
  const connCheck = await checkSupabaseConnection();

  res.status(200).json({
    success: true,
    message: 'Eco-Link API is running',
    supabase: isConfigured,
    databaseConnected: connCheck.connected,
    timestamp: new Date().toISOString()
  });
});

// 2. API Routes
app.use('/api/auth', authRoutes);
app.use('/api/waste', wasteRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/recycler', recyclerRoutes);
app.use('/api/pricing', pricingRoutes);

// 3. 404 Fallback
app.use(notFoundMiddleware);

// 4. Centralized Error Handler
app.use(errorMiddleware);

export default app;
