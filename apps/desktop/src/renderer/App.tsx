/**
 * Main App Component
 */

import React from 'react';
import { HashRouter } from 'react-router-dom';
import { ThemeProvider } from './providers/ThemeProvider';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Layout } from './Layout';
import { AppRouter } from './routes';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <HashRouter>
          <Layout>
            <AppRouter />
          </Layout>
        </HashRouter>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
