import express from 'express';
import { registerMariApiRoutes } from './api-routes';
import { handleStripeWebhook } from './stripe-routes';

const app = express();

app.post(
  '/api/stripe-webhook',
  express.raw({ type: 'application/json' }),
  (req, res) => void handleStripeWebhook(req, res),
);

app.use(express.json({ limit: '2mb' }));
registerMariApiRoutes(app);

const port = Number(process.env['DEV_API_PORT'] ?? 3001);
app.listen(port, () => {
  console.log(`Mari dev API listening on http://127.0.0.1:${port}`);
});
