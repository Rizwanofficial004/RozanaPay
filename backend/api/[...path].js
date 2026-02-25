// Vercel serverless handler for backend project (ESM)
export default async function handler(req, res) {
  try {
    const { default: app } = await import('../src/app.js');
    return app(req, res);
  } catch (error) {
    // Prevent opaque FUNCTION_INVOCATION_FAILED and surface a debuggable response.
    console.error('Backend bootstrap failed:', error);
    return res.status(500).json({
      success: false,
      error: 'Backend failed to initialize',
      hint: 'Check Vercel env vars (DATABASE_URL, JWT_SECRET, CRON_SECRET) and runtime logs.',
    });
  }
}
