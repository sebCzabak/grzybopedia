import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Button,
  MenuItem,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ForestIcon from '@mui/icons-material/Forest';
import LogoutIcon from '@mui/icons-material/Logout';
import Avatar from '@mui/material/Avatar'
import LoginIcon from '@mui/icons-material/Login';
import { useAuth } from '../../contexts/AuthContext';

const pages = [
  { label: 'Rozpoznaj', path: '/' },
  { label: 'Atlas Grzybów', path: '/atlas' },
  { label: 'Tabela Wyników', path: '/leaderboard' },
  { label: 'Mój Profil', path: '/profil', protected: true },
];

export const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => { setAnchorElNav(event.currentTarget); };
  const handleCloseNavMenu = () => { setAnchorElNav(null); };

  const handleLogoutAndClose = () => {
    logout();
    handleCloseNavMenu();
  };

  return (
    <AppBar position="sticky" sx={{ bgcolor: 'surface.main', color: 'surface.contrastText' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <ForestIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1, fontSize: '2rem' }} />
          <Typography
            variant="h6"
            noWrap
            component={NavLink}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            Grzybopedia
          </Typography>

          {/* Menu mobilne (hamburger) */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              keepMounted
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: 'block', md: 'none' } }}
            >
              {pages.map((page) => (
                 (page.protected && !isAuthenticated) ? null : (
                    <MenuItem key={page.label} onClick={handleCloseNavMenu} component={NavLink} to={page.path}>
                      <Typography textAlign="center">{page.label}</Typography>
                    </MenuItem>
                 )
              ))}
              <MenuItem onClick={handleCloseNavMenu}>
                {isAuthenticated ? (
                  <Button onClick={handleLogoutAndClose} color="inherit" startIcon={<LogoutIcon />} fullWidth>Wyloguj</Button>
                ) : (
                  <Button component={NavLink} to="/login" color="inherit" startIcon={<LoginIcon />} fullWidth>Zaloguj</Button>
                )}
              </MenuItem>
            </Menu>
          </Box>

          
          {/* Logo w widoku mobilnym */}
          <ForestIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1, fontSize: '2rem' }} />
          <Typography
            variant="h5"
            noWrap
            component={NavLink}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            Grzybopedia
          </Typography>

        {/* Linki dla widoku desktop + Logowanie/Wylogowanie */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'flex-end', alignItems: 'center' }}>
            {pages.map((page) => (
              (page.protected && !isAuthenticated) ? null : (
                <Button
                  key={page.label} component={NavLink} to={page.path}
                    sx={{ 
                  my: 2, 
                  color: 'text.primary', 
                  display: 'block',
                  fontWeight: 600,
                  '&.active': {
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText'
                  }
                }}
                >
                  {page.label}
                </Button>
              )
            ))}
            {/* Przyciski Logowania/Wylogowania + Avatar */}
            {isAuthenticated ? (
              <>
                {user?.avatarUrl && <Avatar src={user.avatarUrl} sx={{ width: 32, height: 32, ml: 2 }} />}
                <Button color="inherit" onClick={logout} startIcon={<LogoutIcon />} sx={{ ml: 1 }}>
                  Wyloguj
                </Button>
              </>
            ) : (
              <Button component={NavLink} to="/login" color="inherit" startIcon={<LoginIcon />} sx={{ ml: 2 }}>
                Zaloguj
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

