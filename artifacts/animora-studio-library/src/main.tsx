import { createRoot } from 'react-dom/client';
import { Route, Switch } from 'wouter';

import App from './App';
import { ErrorBoundary } from '@/components/error-boundary';
import AuthPage from '@/pages/AuthPage';
import AdminDashboardPage from '@/pages/AdminDashboardPage';

import './index.css';

createRoot(document.getElementById('root')!, {
  // Keeps caught errors off reportError(), which would raise the dev overlay.
  onCaughtError: (error, errorInfo) => {
    console.error(error, errorInfo.componentStack);
  },
}).render(
  <ErrorBoundary>
    <Switch>
      <Route path="/login"><AuthPage mode="login" /></Route>
      <Route path="/signup"><AuthPage mode="signup" /></Route>
      <Route path="/admin/login"><AuthPage mode="login" admin /></Route>
      <Route path="/admin/dashboard"><AdminDashboardPage /></Route>
      <Route path="/"><App /></Route>
      <Route><App /></Route>
    </Switch>
  </ErrorBoundary>,
);
