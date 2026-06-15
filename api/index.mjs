/**
 * Vercel serverless entry — hands all SSR + /api/generate-study-set traffic to Angular's Express handler.
 */
import { reqHandler } from '../dist/mari-app/server/server.mjs';

export default reqHandler;
