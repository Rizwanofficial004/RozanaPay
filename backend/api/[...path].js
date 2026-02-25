// Vercel serverless handler for backend project (ESM)
export default async function handler(req, res) {
  const { default: app } = await import('../src/app.js');
  return app(req, res);
}
