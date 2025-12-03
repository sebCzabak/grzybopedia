import  { useEffect, useState } from 'react';
import {
  Avatar,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress, 
  Alert 
} from "@mui/material";
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import { type LeaderboardUser } from "../types";
import { getLeaderboard } from '../features/leaderboard/leaderboardApi';

export const LeaderboardPage = () => {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getLeaderboard();
        setUsers(data);
      } catch (err: any) {
        console.error("Błąd podczas pobierania rankingu:", err);
        
        let errorMessage = "Nie udało się załadować tabeli wyników. Spróbuj ponownie później.";
        
        if (err.response?.status === 404) {
          errorMessage = "Endpoint /api/leaderboard nie został znaleziony. Upewnij się, że backend jest uruchomiony i endpoint istnieje.";
        } else if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
          errorMessage = "Nie można połączyć się z serwerem. Sprawdź czy backend jest uruchomiony.";
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.response?.data?.error) {
          errorMessage = err.response.data.error;
        }
        
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []); 

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 4 }}>
        <Typography variant="body1" fontWeight="bold" gutterBottom>
          Błąd podczas ładowania rankingu
        </Typography>
        <Typography variant="body2">
          {error}
        </Typography>
        <Typography variant="caption" display="block" sx={{ mt: 1, opacity: 0.8 }}>
          Sprawdź konsolę przeglądarki (F12) aby zobaczyć szczegóły błędu.
        </Typography>
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h3" component="h1" sx={{ mb: 4, fontWeight: 'bold' }}>
        Tabela Wyników
      </Typography>

      <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2 }}>
        <Table aria-label="tabela wyników">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', width: '10%' }}>#</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Użytkownik</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Odznaki</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Punkty</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    Brak danych w rankingu. Bądź pierwszy!
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow
                  key={user.rank}
                  sx={{ 
                    '&:hover': { backgroundColor: 'action.hover', cursor: 'pointer' },
                    '&:last-child td, &:last-child th': { border: 0 } 
                  }}
                >
                <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                  {user.rank}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar alt={user.username} src={user.avatarUrl} />
                    <Typography variant="body1" fontWeight="medium">
                      {user.username}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    <WorkspacePremiumIcon sx={{ color: 'text.secondary', fontSize: '1.2rem' }}/>
                    <Typography variant="body1" fontWeight="bold">
                      {user.badgesCount}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'primary.main' }}>
                  {user.points}
                </TableCell>
              </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};