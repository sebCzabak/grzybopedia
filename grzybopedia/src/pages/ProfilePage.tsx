import { Avatar, Box, Divider, Grid, Icon, List, ListItem, ListItemAvatar, ListItemText, Paper, Typography, CircularProgress, Alert, Button } from "@mui/material";
import { useAuth } from "../contexts/AuthContext"; 
import RefreshIcon from '@mui/icons-material/Refresh';
import { useEffect } from 'react';

export const ProfilePage = () => {

  const { user, isLoading, refetchUser } = useAuth();

  // Odśwież dane przy wejściu na stronę profilu
  useEffect(() => {
    refetchUser(true); // Odśwież w tle bez loadera
  }, [refetchUser]);


  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
  }

  if (!user) {
    return <Alert severity="warning" sx={{ mt: 4 }}>Nie udało się załadować danych profilu. Spróbuj się zalogować ponownie.</Alert>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold' }}>
          Mój Profil
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<RefreshIcon />}
          onClick={() => refetchUser(true)}
          disabled={isLoading}
        >
          Odśwież
        </Button>
      </Box>

      <Grid container spacing={4}>

        <Grid size={{xs:12,md:4}}>
          <Paper elevation={3} sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
            <Avatar

              alt={user.username}
              src={user.avatarUrl}
              sx={{ width: 120, height: 120, mb: 2, border: '4px solid', borderColor: 'primary.main' }}
            />
            <Typography variant="h5" component="h2" fontWeight="bold">
              {user.username}
            </Typography>
            <Typography color="text.secondary">
              Email: {user.email} 
            </Typography>
            <Typography color="text.secondary">
              W społeczności od {new Date(user.memberSince).toLocaleDateString()}
            </Typography>

            <Divider sx={{ my: 3, width: '100%' }} />

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                Znalezionych grzybów
              </Typography>
              <Typography variant="h3" fontWeight="bold" color="primary">
                {user.mushroomsFound}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Kolumna z odznakami */}
        <Grid size={{xs:12,md:8}}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom>
              Zdobyte Odznaki
            </Typography>
            {user.badges && user.badges.length > 0 ? (
              <List>
                {user.badges.map((badge, index) => (
                  <Box key={badge.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'surface.main' }}>
                          <Icon sx={{ color: 'secondary.main' }}>{badge.icon}</Icon>
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={badge.name}
                        secondary={badge.description}
                        primaryTypographyProps={{ fontWeight: 'bold' }}
                      />
                    </ListItem>
                    {index < user.badges.length - 1 && <Divider variant="inset" component="li" />}
                  </Box>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary" sx={{ mt: 2 }}>
                Nie zdobyłeś jeszcze żadnych odznak. Czas ruszyć do lasu! 🌲
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};