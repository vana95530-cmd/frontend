import { Outlet, Link } from 'react-router-dom';
import { AppBar, Toolbar, Button, Container, Typography } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const Layout = () => {
  const { user, logout } = useAuth();

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'white' }}>
            Нерухомість Черкаси
          </Typography>
          {user ? (
            <>
              <Button color="inherit" component={Link} to="/profile">
                Мій кабінет
              </Button>
              {user.role === 'admin' && (
                <Button color="inherit" component={Link} to="/admin">
                  Адмін-панель
                </Button>
              )}
              <Button color="inherit" onClick={logout}>
                Вийти
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/login">
                Увійти
              </Button>
              <Button color="inherit" component={Link} to="/register">
                Реєстрація
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 4 }}>
        <Outlet />
      </Container>
    </>
  );
};

export default Layout;