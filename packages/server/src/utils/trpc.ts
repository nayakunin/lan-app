import { initTRPC, TRPCError } from '@trpc/server';

import { Context } from '../context/index.js';

const t = initTRPC.context<Context>().create();

export const isAuthed = t.middleware(({ next, ctx }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      user: ctx.user,
    },
  });
});

// Base router and procedure helpers
export const router = t.router;
export const procedure = t.procedure;
export const middleware = t.middleware;
export const protectedProcedure = t.procedure.use(isAuthed);