import clsx from 'clsx';
import { format } from 'date-fns';
import { useFormik } from 'formik';
import jwt from 'jsonwebtoken';
import { useState } from 'react';

import { Message as MessageType, WithId } from 'lan-app-2-server';
import { useAuth } from '@/hooks';
import { trpc } from '@/utils/trpc';

type MessageProps = MessageType;

const Message = ({ author, text, timestamp }: MessageProps) => {
  const auth = useAuth();

  return (
    <div
      className={clsx('rounded bg-zinc-800 p-2 w-fit text-white', {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        // 'ml-auto': auth.jwt && author.id === (jwt.decode(auth.jwt) as any).id,
      })}
    >
      <div>From: {author.name}</div>
      <div>{text}</div>
      <div className="text-end">{format(timestamp, 'HH:mm:ss')}</div>
    </div>
  );
};

export const Chat = () => {
  const [messages, setMessages] = useState<WithId<MessageType>[]>([]);
  trpc.chat.onAdd.useSubscription(undefined, {
    onData(data) {
      setMessages((prev) => [...prev, data]);
    },
  });
  const postMessage = trpc.chat.add.useMutation();

  const formik = useFormik({
    initialValues: {
      message: '',
    },
    onSubmit: async (values, props) => {
      try {
        await postMessage.mutateAsync({
          text: values.message,
        });

        props.resetForm();
      } catch {}
    },
  });

  return (
    <div className="p-4 min-h-screen relative flex flex-col">
      <h1 className="fixed top-0 left-0 p-4 w-full text-3xl text-white bg-zinc-900">Chat</h1>
      <div className="pt-14 pb-14 min-h-full flex justify-end flex-col flex-grow">
        <div className="pt-4 flex flex-col gap-2 overflow-y-scroll">
          {messages.map((message) => (
            <Message key={message.id} {...message} />
          ))}
        </div>
        <div className="p-2 bg-zinc-800 fixed bottom-0 left-0 w-full">
          <form onSubmit={formik.handleSubmit} className="flex justify-between gap-2">
            <input
              className="p-2 bg-zinc-700 rounded text-white w-full"
              name="message"
              value={formik.values.message}
              onChange={formik.handleChange}
            />
            <button className="p-2 bg-zinc-700 rounded text-white" type="submit">
              submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
