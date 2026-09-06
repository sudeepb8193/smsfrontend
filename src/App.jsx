import React from 'react';
import { AuthProvider } from './store/AuthContext';
import { ThemeProvider } from './store/ThemeContext';
import { useAuth } from './hooks/useAuth';
import AppRoutes from './routes/AppRoutes';
import Loader from './components/common/Loader/Loader';
import { Toaster } from 'sonner';

const MainShell = () => {
  const { loading } = useAuth();

  if (loading) {
    return <Loader fullPage text="Initializing SalonFlow Pro..." />;
  }

  return (
    <>
      <AppRoutes />
      <Toaster position="top-right" duration={3000} visibleToasts={1} richColors />
    </>
  );
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
