import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './lib/react-query';
import router from './Router';
import { Toaster } from 'react-hot-toast';
import { RouterProvider } from 'react-router-dom';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster
        position="top-center"
        gutter={12}
        containerStyle={{ margin: '8px' }}
        toastOptions={{
          success: {
            duration: 3000,
            icon: '✅',
          },
          error: {
            duration: 5000,
            icon: '❌',
          },
          loading: {
            duration: 2000,
            icon: '⏳',
          },
          style: {
            fontSize: '14px',
            maxWidth: '500px',
            padding: '16px 24px',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          },
        }}
      />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
