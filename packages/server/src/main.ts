import * as trpcExpress from '@trpc/server/adapters/express';
import express from 'express';
import cors from 'cors';

import { createContext } from './context/index.js';
import { appRouter } from './routers/_app.js';
import { startServer } from './utils/index.js';
import { applyWSSHandler } from '@trpc/server/adapters/ws';
import ws from 'ws';

const app = express();

const port = 8080;
const optionsHost: string | boolean | undefined =
  process.argv[2] === '--host' ? process.argv[3] || true : undefined;

app.use(cors());

app.use(
  '/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

const server = await startServer(app, port, optionsHost);

console.log(ws);

const wss = new ws.Server({ server });
const handler = applyWSSHandler({ wss, router: appRouter, createContext });

wss.on('connection', (ws) => {
  console.log(`➕➕ Connection (${wss.clients.size})`);
  ws.once('close', () => {
    console.log(`➖➖ Connection (${wss.clients.size})`);
  });
});
console.log('✅ WebSocket Server listening on ws://localhost:8080');

process.on('SIGTERM', () => {
  console.log('SIGTERM');
  handler.broadcastReconnectNotification();
  wss.close();
});
