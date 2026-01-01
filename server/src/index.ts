// ============================================================================
// METABOLIC SIMULATOR - SERVER ENTRY POINT
// ============================================================================

import { createServer } from './api/server';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

createServer(PORT);
