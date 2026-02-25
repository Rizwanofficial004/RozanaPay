// Vercel serverless handler for backend project (ESM)
import app from '../src/app.js';

export default function handler(req, res) {
  return app(req, res);
}
