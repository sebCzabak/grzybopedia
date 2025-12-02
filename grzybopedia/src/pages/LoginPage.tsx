import { useState, type FormEvent } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { Box, Button, Container, Paper, TextField, Typography, Divider, Alert, Link, Grid, CircularProgress } from "@mui/material";
import GoogleIcon from '@mui/icons-material/Google';
import axiosInstance from '../api/axiosInstance'; 
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

export const LoginPage = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth(); 
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/profil"; 

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isRegistering) {
        // --- REJESTRACJA ---
        await axiosInstance.post('/auth/register', { username, email, password });
        setIsRegistering(false);
        toast.success("Rejestracja zakończona pomyślnie! Możesz się teraz zalogować.");
      } else {
        // --- LOGOWANIE ---
        const response = await axiosInstance.post('/auth/login', { email, password });
        const { token } = response.data;
        await login(token); 
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || `Wystąpił błąd: ${err.message}`;
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // const handleGoogleLogin = () => {
  //   window.location.href = 'http://localhost:5001/api/auth/google'; 
  // };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={6} sx={{ mt: 8, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">{isRegistering ? "Rejestracja" : "Logowanie"}</Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          {isRegistering && (
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Nazwa użytkownika"
              name="username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
          )}
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Adres Email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus={!isRegistering} 
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Hasło"
            type="password"
            id="password"
            autoComplete={isRegistering ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <Alert severity="error" sx={{ mt: 2, width: '100%' }}>{error}</Alert>}

          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={isLoading}>
            {isLoading ? <CircularProgress size={24} /> : (isRegistering ? "Zarejestruj się" : "Zaloguj się")}
          </Button>

          <Divider sx={{ my: 2 }}>LUB</Divider>

          {/* <Button fullWidth variant="outlined" startIcon={<GoogleIcon />} onClick={handleGoogleLogin} disabled={isLoading}>
            {isRegistering ? "Zarejestruj się z Google" : "Zaloguj się z Google"}
          </Button> */}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Link component="button" variant="body2" onClick={() => { setIsRegistering(!isRegistering); setError(null); }}>
              {isRegistering ? "Masz już konto? Zaloguj się" : "Nie masz konta? Zarejestruj się"}
            </Link>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}