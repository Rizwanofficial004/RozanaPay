import app from './app.js';

// Initialize cron service for local development (not on Vercel)
if (!process.env.VERCEL) {
  import('./services/cronService.js');
}

const PORT = process.env.PORT || 5000;

// Only start server when run directly (not when imported by Vercel serverless)
const isServerless = typeof process.env.VERCEL !== 'undefined';
if (!isServerless) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}
