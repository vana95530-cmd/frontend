import { Outlet, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  AppBar, Toolbar, Typography, Button, Container, Box
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';

const Layout = () => {
  const { user, logout } = useAuth();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <HomeIcon sx={{ mr: 1 }} />
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{ flexGrow: 1, textDecoration: 'none', color: 'white' }}
          >
            Нерухомість Черкаси
          </Typography>
          {user ? (
            <>
              <Button color="inherit" component={RouterLink} to="/profile">
                Мій кабінет
              </Button>
              {user.role === 'admin' && (
                <Button color="inherit" component={RouterLink} to="/admin">
                  Адмін-панель
                </Button>
              )}
              <Button color="inherit" onClick={logout}>
                Вийти
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={RouterLink} to="/login">
                Увійти
              </Button>
              <Button color="inherit" component={RouterLink} to="/register">
                Реєстрація
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>
      <Container component="main" sx={{ flex: 1, py: 4 }}>
        <Outlet />
      </Container>
      <Box component="footer" sx={{ py: 2, textAlign: 'center', bgcolor: '#f5f5f5' }}>
        <Typography variant="body2" color="textSecondary">
          © {new Date().getFullYear()} Нерухомість Черкаси. Дипломний проект.
        </Typography>
      </Box>
    </Box>
  );
};

export default Layout;