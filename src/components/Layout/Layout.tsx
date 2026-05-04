import { useState, useEffect } from 'react';
import { Outlet, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  AppBar, Toolbar, Typography, Button, Container, Box,
  IconButton
} from '@mui/material';
import { chatService } from '../../services/chatService';
import ChatWidget from '../ChatWidget/ChatWidget';
import { Home as HomeIcon } from '@mui/icons-material';

const Layout = () => {
  const { user, logout } = useAuth();
  const [adminId, setAdminId] = useState<number | null>(null);
  const [adminChatOpen, setAdminChatOpen] = useState(false);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      chatService.getAdminId()
        .then(id => setAdminId(id))
        .catch(console.error);
    }
  }, [user]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton component={RouterLink} to="/" color="inherit" sx={{ mr: 1 }}>
            <HomeIcon />
          </IconButton>
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
              <Button color="inherit" component={RouterLink} to="/ads/create">
                Створити оголошення
              </Button>
              <Button color="inherit" component={RouterLink} to="/profile">
                Мій кабінет
              </Button>
              {user.role === 'admin' && (
                <Button color="inherit" component={RouterLink} to="/admin">
                  Адмін-панель
                </Button>
              )}
              {user.role !== 'admin' && (
                <Button color="inherit" onClick={() => setAdminChatOpen(true)}>
                  Чат з адміністратором
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

      {/* Чат-віджет для адміністратора */}
      {adminChatOpen && adminId && user && (
        <ChatWidget
          partnerId={adminId}
          adId={0}
          partnerName="Адміністратор"
          onClose={() => setAdminChatOpen(false)}
        />
      )}
    </Box>
  );
};

export default Layout;