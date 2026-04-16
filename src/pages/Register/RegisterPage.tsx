import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Container, Box, Typography, TextField, Button, Alert, Link, Paper
} from '@mui/material';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    phone: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Паролі не співпадають');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await register({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        phone: formData.phone
      });
      navigate('/login', { state: { message: 'Реєстрація успішна! Тепер увійдіть.' } });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Помилка реєстрації');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Реєстрація
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Email"
            name="email"
            type="email"
            fullWidth
            required
            margin="normal"
            value={formData.email}
            onChange={handleChange}
          />
          <TextField
            label="Повне ім'я"
            name="full_name"
            fullWidth
            margin="normal"
            value={formData.full_name}
            onChange={handleChange}
          />
          <TextField
            label="Телефон"
            name="phone"
            fullWidth
            margin="normal"
            value={formData.phone}
            onChange={handleChange}
          />
          <TextField
            label="Пароль"
            name="password"
            type="password"
            fullWidth
            required
            margin="normal"
            value={formData.password}
            onChange={handleChange}
          />
          <TextField
            label="Підтвердження паролю"
            name="confirmPassword"
            type="password"
            fullWidth
            required
            margin="normal"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            sx={{ mt: 3 }}
            disabled={loading}
          >
            {loading ? 'Реєстрація...' : 'Зареєструватися'}
          </Button>
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Link component={RouterLink} to="/login" variant="body2">
              Вже маєте акаунт? Увійти
            </Link>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default RegisterPage;