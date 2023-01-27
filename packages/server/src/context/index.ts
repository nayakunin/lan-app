import { inferAsyncReturnType } from '@trpc/server';
import * as trpcExpress from '@trpc/server/adapters/express';
import { NodeHTTPCreateContextFnOptions } from '@trpc/server/adapters/node-http';
import { IncomingMessage } from 'http';
import jwt from 'jsonwebtoken';
import ws from 'ws';

export async function createContext({
  req,
}: trpcExpress.CreateExpressContextOptions | NodeHTTPCreateContextFnOptions<IncomingMessage, ws>) {
  async function getUserFromHeader() {
    if (req.headers.authorization) {
      const token = JSON.parse(req.headers.authorization);

      try {
        const decoded = jwt.verify(token, 'secret');
        return decoded;
      } catch (err) {
        // eslint-disable-next-line no-console
        console.log('here', err);
      }
    }
    return null;
  }
  const user = await getUserFromHeader();

  return {
    user,
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;
