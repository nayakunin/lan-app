export type Message = {
  text: string;
  author: {
    name: string;
    id: string;
  };
  timestamp: number;
}

export type User = {
  name: string;
};

export type WithId<T> = T & { id: string };