import express from 'express';
import { registerGeminiStudyRoutes } from './gemini-study';

const app = express();
app.use(express.json({ limit: '2mb' }));
registerGeminiStudyRoutes(app);

const port = Number(process.env['DEV_API_PORT'] ?? 3001);
app.listen(port, () => {
  console.log(`Mari dev API listening on http://127.0.0.1:${port}`);
});
