import React from 'react';
import { AuthProvider } from './store/AuthContext';
import { ThemeProvider } from './store/ThemeContext';
import { useAuth } from './hooks/useAuth';
import { LoginPage } from './components/LoginPage';
import AppRoutes from './routes/AppRoutes';
import Loader from './components/common/Loader/Loader';

const MainShell = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loader fullPage text="Initializing SalonFlow Pro..." />;
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <AppRoutes />;
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <MainShell />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
