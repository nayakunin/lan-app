import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createWSClient, httpBatchLink, splitLink, wsLink } from '@trpc/client';
import { useState } from 'react';
import { trpc } from './utils/trpc';
import { AuthProvider } from './contexts';
import { Root } from './pages/root';
import { Auth } from './pages/auth';
import { Chat } from './pages/chat';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
  },
  {
    path: '/login',
    element: <Auth />,
  },
  {
    path: '/chat',
    element: <Chat />,
  },
]);

export const App = () => {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() => {
    const token = localStorage.getItem('jwt') || '';

    return trpc.createClient({
      links: [
        splitLink({
          condition(op) {
            return op.type === 'subscription';
          },
          true: wsLink({
            client: createWSClient({
              url: `ws://localhost:8080`,
            }),
          }),
          false: httpBatchLink({
            url: 'http://localhost:8080/trpc',
            // optional
            headers() {
              return {
                authorization: token,
              };
            }
          })
        }),
      ],
    });
  });

  return (
    <AuthProvider>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <main className="bg-zinc-900">
            <RouterProvider router={router} />
          </main>
        </QueryClientProvider>
      </trpc.Provider>
    </AuthProvider>
  );
};
