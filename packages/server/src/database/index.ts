import { Message, User, WithId } from "./types.js";

export const database = {
  chat: [{
    id: '1',
    text: 'Hello world!',
    author: {
      name: 'John Doe',
      id: '1'
    },
    timestamp: Date.now(),
  }, {
    id: '2',
    text: 'Hello world!',
    author: {
      name: 'John Doe',
      id: '1'
    },
    timestamp: Date.now(),
  }] as WithId<Message>[],
  users: {} as Record<string, User>,
  buffer: [] as number[],
}