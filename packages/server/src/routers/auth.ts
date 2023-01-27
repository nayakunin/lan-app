import { TRPCError } from '@trpc/server';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import { z } from 'zod';

import { procedure, router } from '../utils/trpc.js';

export const auth = router({
  login: procedure
    .input(
      z.object({
        name: z.string(),
      })
    )
    .mutation(({ input }) => {
      try {
        const token = jwt.sign({ name: input.name, id: nanoid() }, 'secret', { expiresIn: '6h' });
        return { token };
      } catch (error) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }
    }),
});
