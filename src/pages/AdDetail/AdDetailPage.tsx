import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Typography, Box, Grid, Button, Card, CardMedia, Chip, Divider, Alert, CircularProgress,
  ImageList, ImageListItem
} from '@mui/material';
import { adService } from '../../services/adService';
import { useAuth } from '../../context/AuthContext';
import type { Advertisement } from '../../types';
import ChatWidget from '../../components/ChatWidget/ChatWidget';

const AdDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ad, setAd] = useState<Advertisement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mainPhoto, setMainPhoto] = useState<string>('');
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchAd(parseInt(id));
    }
  }, [id]);

  const fetchAd = async (adId: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await adService.getAdById(adId);
      setAd(data);
      const main = data.photos.find(p => p.is_main)?.url || data.photos[0]?.url || '';
      setMainPhoto(main);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Помилка завантаження оголошення');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!ad || !window.confirm('Ви впевнені, що хочете видалити оголошення?')) return;
    try {
      await adService.deleteAd(ad.ad_id);
      navigate('/profile');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Помилка видалення');
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" my={4}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!ad) return <Alert severity="warning">Оголошення не знайдено</Alert>;

  const isOwner = user?.user_id === ad.user_id;
  const isAdmin = user?.role === 'admin';

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={7}>
          <Card>
            <CardMedia
              component="img"
              height="400"
              image={mainPhoto ? `http://localhost:5000${mainPhoto}` : '/placeholder.jpg'}
              alt={ad.title}
            />
          </Card>
          {ad.photos.length > 1 && (
            <ImageList sx={{ mt: 1 }} cols={4} rowHeight={100}>
              {ad.photos.map(photo => (
                <ImageListItem key={photo.photo_id} onClick={() => setMainPhoto(photo.url)}>
                  <img
                    src={`http://localhost:5000${photo.url}`}
                    alt=""
                    loading="lazy"
                    style={{ cursor: 'pointer', border: mainPhoto === photo.url ? '2px solid blue' : 'none' }}
                  />
                </ImageListItem>
              ))}
            </ImageList>
          )}
        </Grid>

        <Grid item xs={12} md={5}>
          <Typography variant="h4" gutterBottom>{ad.title}</Typography>
          <Chip label={ad.status === 'active' ? 'Активне' : ad.status} color={ad.status === 'active' ? 'success' : 'default'} sx={{ mb: 2 }} />
          <Typography variant="h5" color="primary" gutterBottom>
            ${ad.price.toLocaleString()}
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="body1" paragraph>{ad.description}</Typography>
          <Grid container spacing={1}>
            <Grid item xs={6}><Typography><strong>Тип:</strong> {ad.property_type}</Typography></Grid>
            <Grid item xs={6}><Typography><strong>Район:</strong> {ad.district}</Typography></Grid>
            {ad.address && <Grid item xs={12}><Typography><strong>Адреса:</strong> {ad.address}</Typography></Grid>}
            <Grid item xs={6}><Typography><strong>Площа:</strong> {ad.area} м²</Typography></Grid>
            <Grid item xs={6}><Typography><strong>Кімнат:</strong> {ad.rooms}</Typography></Grid>
            {ad.floor && <Grid item xs={6}><Typography><strong>Поверх:</strong> {ad.floor} / {ad.total_floors}</Typography></Grid>}
          </Grid>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" gutterBottom>
            Продавець: {ad.author?.full_name}
          </Typography>
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            {user && !isOwner && (
              <Button variant="contained" onClick={() => setChatOpen(true)}>
                Написати продавцю
              </Button>
            )}
            {isOwner && (
              <>
                <Button variant="outlined" onClick={() => navigate(`/ads/${ad.ad_id}/edit`)}>
                  Редагувати
                </Button>
                <Button variant="outlined" color="error" onClick={handleDelete}>
                  Видалити
                </Button>
              </>
            )}
            {isAdmin && !isOwner && (
              <Button variant="outlined" color="error" onClick={handleDelete}>
                Видалити (адмін)
              </Button>
            )}
          </Box>
        </Grid>
      </Grid>
      {chatOpen && ad && (
        <ChatWidget
          partnerId={ad.user_id}
          adId={ad.ad_id}
          partnerName={ad.author?.full_name || 'Продавець'}
          onClose={() => setChatOpen(false)}
        />
      )}
    </Container>
  );
};

export default AdDetailPage;