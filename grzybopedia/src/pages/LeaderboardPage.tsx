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
} from "@mui/material";
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import { mockLeaderboard } from "../features/leaderboard/mockData";
import { type LeaderboardUser } from "../types";

export const LeaderboardPage = () => {
  const users: LeaderboardUser[] = mockLeaderboard;

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
            {users.map((user) => (
              <TableRow
                key={user.rank}
                sx={{ 
                  '&:hover': { 
                    backgroundColor: 'action.hover',
                    cursor: 'pointer'
                  },
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
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};