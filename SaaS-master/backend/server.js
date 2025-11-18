import dotenv from 'dotenv';
// Load environment variables FIRST before any other imports
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import healthRoutes from './routes/healthRoutes.js';
import googleAuthRoutes from './routes/googleAuthRoutes.js';
import facebookAuthRoutes from './routes/facebookAuthRoutes.js';
import facebookMetricsRoutes from './routes/facebookMetricsRoutes.js';
import instagramAuthRoutes from './routes/instagramAuthRoutes.js';
import instagramMetricsRoutes from './routes/instagramMetricsRoutes.js';
import linkedinMetricsRoutes from './routes/linkedinMetricsRoutes.js';
import linkedinAuthRoutes from './routes/linkedinAuthRoutes.js';
import lighthouseRoutes from './routes/lighthouseRoutes.js';
import userAnalyticsRoutes from './routes/userAnalyticsRoutes.js';
import searchConsoleRoutes from './routes/searchConsoleRoutes.js';
import trafficRoutes from './routes/trafficRoutes.js';
import competitorRoutes from './routes/competitorRoutes.js';
import debugRoutes from './routes/debugRoutes.js';
import pdfRoutes from './routes/pdfRoutes.js';
import socialReportRoutes from './routes/socialReportRoutes.js';
import socialStatusRoutes from './routes/socialStatusRoutes.js';
import socialConnectRoutes from './routes/socialConnectRoutes.js';
import businessInfoRoutes from './routes/businessInfoRoutes.js';
import businessCompetitorsRoutes from './routes/businessCompetitorsRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import aiInsightsRoutes from './routes/aiInsightsRoutes.js';

const app = express();
const PORT = process.env.PORT || 3010;

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3002', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/health', healthRoutes);
app.use('/api', googleAuthRoutes);
app.use('/api', facebookAuthRoutes);
app.use('/api/facebook', facebookMetricsRoutes);
app.use('/api', instagramAuthRoutes);
app.use('/api/instagram', instagramMetricsRoutes);
app.use('/api/linkedin', linkedinMetricsRoutes);
app.use('/api/auth/linkedin', linkedinAuthRoutes);
app.use('/api', lighthouseRoutes);
app.use('/api', userAnalyticsRoutes);
app.use('/api', searchConsoleRoutes);
app.use('/api', trafficRoutes);
app.use('/api/competitor', competitorRoutes);
app.use('/api/debug', debugRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/social/report', socialReportRoutes);
app.use('/api/social', socialStatusRoutes);
app.use('/api/social', socialConnectRoutes);
app.use('/api/business-info', businessInfoRoutes);
app.use('/api/business-competitors', businessCompetitorsRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/ai-insights', aiInsightsRoutes);

// Health check endpoint
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'SEO Health Score API'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!', 
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 SEO Health Score API running on port ${PORT}`);
  console.log(`📍 Health endpoint: http://localhost:${PORT}/api/status`);
  console.log(`🔐 Google Auth: http://localhost:${PORT}/api/auth/google`);
  console.log(`📘 Facebook Auth: http://localhost:${PORT}/api/auth/facebook`);
  console.log(`📸 Instagram Auth: http://localhost:${PORT}/api/auth/instagram`);
  console.log(`📸 Instagram Metrics: http://localhost:${PORT}/api/instagram`);
  console.log(`⚡ Lighthouse: http://localhost:${PORT}/api/lighthouse`);
  console.log(`📈 Analytics: http://localhost:${PORT}/api/analytics`);
  console.log(`🔍 Search Console: http://localhost:${PORT}/api/search-console`);
  console.log(`📊 Traffic: http://localhost:${PORT}/api/traffic`);
  console.log(`🏆 Competitor: http://localhost:${PORT}/api/competitor`);
  console.log(`📱 Facebook Metrics: http://localhost:${PORT}/api/facebook`);
  console.log(`🏢 Business Info: http://localhost:${PORT}/api/business-info`);
});

export default app;
