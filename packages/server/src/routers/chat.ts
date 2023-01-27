import { observable } from '@trpc/server/observable';
import { EventEmitter } from 'events';
import { z } from 'zod';
import crypto from 'crypto';

import { database } from '../database/index.js';
import { protectedProcedure, router } from '../utils/trpc.js';
import { Message, WithId } from '../database/types.js';

const ee = new EventEmitter();

export const chat = router({
  onAdd: protectedProcedure.subscription(() => {
    return observable<WithId<Message>>((emit) => {
      const onAdd = (data: WithId<Message>) => {
        console.log('here');
        emit.next(data);
      };
      
      ee.on('add', onAdd);

      return () => {
        ee.off('add', onAdd);
      };
    });
  }),
  add: protectedProcedure
    .input(
      z.object({
        text: z.string(),
      })
    )
    .mutation(({ input, ctx }) => {
      const message: WithId<Message> = {
        id: crypto.randomUUID(),
        text: input.text,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        author: ctx.user,
        timestamp: Date.now(),
      };

      database.chat.push(message);

      ee.emit('add', message);

      return;
    }),
});
