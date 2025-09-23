import { ThemeProvider, CssBaseline, Container } from '@mui/material'; 
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { theme } from './theme/theme';
import { Navbar } from './components/layout/Navbar';
import { HomePage } from './pages/HomePage'; 
import { AtlasPage } from './pages/AtlasPage';
import { MushroomDetailPage } from './pages/MushroomDetailPage';
import { ProfilePage } from './pages/ProfilePage';
import { LeaderboardPage } from './pages/LeaderboardPage';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Navbar />
        <Container component="main" maxWidth="xl" sx={{ mt: 2 }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/atlas" element={<AtlasPage />} />
            <Route path="/atlas/:id" element={<MushroomDetailPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/profil" element={<ProfilePage />} />
          </Routes>
        </Container>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;