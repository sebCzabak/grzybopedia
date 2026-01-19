import { ThemeProvider, CssBaseline, Container } from '@mui/material'; 
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { theme } from './theme/theme';
import { Navbar } from './components/layout/Navbar';
import { HomePage } from './pages/HomePage'; 
import { AtlasPage } from './pages/AtlasPage';
import { MushroomDetailPage } from './pages/MushroomDetailPage';
import { ProfilePage } from './pages/ProfilePage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { LoginPage } from './pages/LoginPage';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import InstallPWA from './components/InstallPWA';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <ToastContainer
            position="top-right" 
            autoClose={5000}     
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            pauseOnHover
            theme="light" 
          />
        <Container component="main" maxWidth="xl" sx={{ mt: 2 }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/atlas" element={<AtlasPage />} />
            <Route path="/atlas/:id" element={<MushroomDetailPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route 
              path="/profil" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </Container>
        <InstallPWA />
      </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;