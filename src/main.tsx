import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import App from './App.tsx';
import './index.css';
import { store, persistor } from './store/store.ts';

// Performance monitoring
if (import.meta.env.DEV) {
  const startTime = performance.now();
  console.log(`⏱️ App starting...`);

  const logLoadTime = () => {
    const endTime = performance.now();
    console.log(`⏱️ App loaded in ${(endTime - startTime).toFixed(2)}ms`);
  };

  // Check if window is defined (for SSR safety) and use appropriate method.
  // NOTE: `'requestIdleCallback' in window` was narrowing the else branch's
  // `window` to `never` — since requestIdleCallback is an unconditional
  // property on the global Window type, TS has no "doesn't have it" subtype
  // to narrow to there. Checking the property's own type avoids the issue
  // entirely, since it narrows `window.requestIdleCallback`, not `window`.
  if (typeof window !== 'undefined') {
    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(logLoadTime);
    } else {
      window.addEventListener('load', logLoadTime);
    }
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </StrictMode>
);
