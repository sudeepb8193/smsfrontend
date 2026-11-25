import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './config/queryClient';
import { AuthProvider } from './store/AuthContext';
import { ThemeProvider } from './store/ThemeContext';
import { useAuth } from './hooks/useAuth';
import AppRoutes from './routes/AppRoutes';
import Loader from './components/shared/Loader';
import { ToastProvider } from './components/shared/Toast';
import { OrganisationProvider } from './features/organisation/context/OrganisationContext';
import { BranchProvider } from './features/branch/context/BranchContext';

const MainShell = () => {
  const { loading } = useAuth();

  if (loading) {
    return <Loader fullPage text="Initializing SalonFlow Pro..." />;
  }

  return <AppRoutes />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider defaultDuration={4000} maxToasts={4}>
            <OrganisationProvider>
              <BranchProvider>
                <MainShell />
              </BranchProvider>
            </OrganisationProvider>
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
