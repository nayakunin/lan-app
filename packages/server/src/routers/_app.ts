import { router } from '../utils/trpc.js';
import { auth } from './auth.js';
import { chat } from './chat.js';

export const appRouter = router({
  auth,
  chat,
});

// export type definition of API
export type AppRouter = typeof appRouter;
