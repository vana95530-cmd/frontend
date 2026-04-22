import { useState, useEffect } from 'react';
import {
  Container, Typography, Tabs, Tab, Box, CircularProgress,
  Card, CardContent, CardActions, Button, Chip, Grid, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, List, ListItem, ListItemText,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adService } from '../../services/adService';
import { userService } from '../../services/userService';
import type { Advertisement, SearchHistoryItem, FavoriteAd } from '../../types';
import { Delete as DeleteIcon, Visibility as VisibilityIcon } from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

const ProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [myAds, setMyAds] = useState<Advertisement[]>([]);
  const [loadingAds, setLoadingAds] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [favorites, setFavorites] = useState<FavoriteAd[]>([]);
  const [loadingFav, setLoadingFav] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Профіль
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [profileData, setProfileData] = useState({ full_name: user?.full_name || '', phone: user?.phone || '' });
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({ old: '', new: '', confirm: '' });

  useEffect(() => {
    if (tabValue === 0) fetchMyAds();
    if (tabValue === 1) fetchSearchHistory();
    if (tabValue === 2) fetchFavorites();
  }, [tabValue]);

  const fetchMyAds = async () => {
    setLoadingAds(true);
    try {
      const ads = await userService.getMyAds();
      setMyAds(ads);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Помилка завантаження');
    } finally {
      setLoadingAds(false);
    }
  };

  const fetchSearchHistory = async () => {
    setLoadingHistory(true);
    try {
      const history = await userService.getSearchHistory();
      setSearchHistory(history);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Помилка');
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchFavorites = async () => {
    setLoadingFav(true);
    try {
      const favs = await userService.getFavorites();
      setFavorites(favs);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Помилка');
    } finally {
      setLoadingFav(false);
    }
  };

  const handleDeleteAd = async (adId: number) => {
    if (!window.confirm('Видалити оголошення?')) return;
    try {
      await adService.deleteAd(adId);
      setMyAds(prev => prev.filter(ad => ad.ad_id !== adId));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Помилка видалення');
    }
  };

  const handleRemoveFavorite = async (adId: number) => {
    try {
      await userService.removeFromFavorites(adId);
      setFavorites(prev => prev.filter(f => f.ad_id !== adId));
    } catch (err: any) {
      alert('Помилка видалення з обраного');
    }
  };

  const handleApplySearchParams = (params: any) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
    });
    navigate(`/?${query.toString()}`);
  };

  const handleUpdateProfile = async () => {
    try {
      await userService.updateProfile(profileData);
      setEditProfileOpen(false);
      window.location.reload(); // оновити дані в контексті
    } catch (err: any) {
      alert(err.response?.data?.error || 'Помилка оновлення');
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.new !== passwordData.confirm) {
      alert('Нові паролі не співпадають');
      return;
    }
    try {
      await userService.changePassword(passwordData.old, passwordData.new);
      setChangePasswordOpen(false);
      alert('Пароль змінено');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Помилка зміни паролю');
    }
  };

  if (!user) return null;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Особистий кабінет</Typography>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab label="Мої оголошення" />
          <Tab label="Історія пошуку" />
          <Tab label="Обране" />
          <Tab label="Налаштування" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        {loadingAds ? <CircularProgress /> : (
          <Grid container spacing={2}>
            {myAds.length === 0 ? <Typography>Немає оголошень</Typography> : (
              myAds.map(ad => (
                <Grid item xs={12} sm={6} md={4} key={ad.ad_id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">{ad.title}</Typography>
                      <Chip label={ad.status} size="small" color={ad.status === 'active' ? 'success' : (ad.status === 'rejected' ? 'error' : 'default')} />
                      <Typography>${ad.price}</Typography>
                    </CardContent>
                    <CardActions>
                      <Button size="small" onClick={() => navigate(`/ads/${ad.ad_id}`)}>Переглянути</Button>
                      <Button size="small" onClick={() => navigate(`/ads/${ad.ad_id}/edit`)}>Редагувати</Button>
                      <IconButton size="small" onClick={() => handleDeleteAd(ad.ad_id)}><DeleteIcon /></IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {loadingHistory ? <CircularProgress /> : (
          <List>
            {searchHistory.map(item => (
              <ListItem key={item.search_id} secondaryAction={
                <IconButton onClick={() => handleApplySearchParams(item.query_params)}><VisibilityIcon /></IconButton>
              }>
                <ListItemText
                  primary={new Date(item.created_at).toLocaleString()}
                  secondary={JSON.stringify(item.query_params)}
                />
              </ListItem>
            ))}
          </List>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {loadingFav ? <CircularProgress /> : (
          <Grid container spacing={2}>
            {favorites.map(ad => (
              <Grid item xs={12} sm={6} md={4} key={ad.ad_id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{ad.title}</Typography>
                    <Typography>${ad.price} · {ad.district}</Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" onClick={() => navigate(`/ads/${ad.ad_id}`)}>Переглянути</Button>
                    <IconButton size="small" onClick={() => handleRemoveFavorite(ad.ad_id)}><DeleteIcon /></IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Box>
          <Typography variant="h6">Особисті дані</Typography>
          <Button variant="outlined" onClick={() => setEditProfileOpen(true)} sx={{ mr: 2 }}>Редагувати профіль</Button>
          <Button variant="outlined" onClick={() => setChangePasswordOpen(true)}>Змінити пароль</Button>

          <Dialog open={editProfileOpen} onClose={() => setEditProfileOpen(false)}>
            <DialogTitle>Редагувати профіль</DialogTitle>
            <DialogContent>
              <TextField label="Повне ім'я" fullWidth margin="dense" value={profileData.full_name} onChange={e => setProfileData({...profileData, full_name: e.target.value})} />
              <TextField label="Телефон" fullWidth margin="dense" value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})} />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEditProfileOpen(false)}>Скасувати</Button>
              <Button onClick={handleUpdateProfile}>Зберегти</Button>
            </DialogActions>
          </Dialog>

          <Dialog open={changePasswordOpen} onClose={() => setChangePasswordOpen(false)}>
            <DialogTitle>Зміна паролю</DialogTitle>
            <DialogContent>
              <TextField label="Поточний пароль" type="password" fullWidth margin="dense" value={passwordData.old} onChange={e => setPasswordData({...passwordData, old: e.target.value})} />
              <TextField label="Новий пароль" type="password" fullWidth margin="dense" value={passwordData.new} onChange={e => setPasswordData({...passwordData, new: e.target.value})} />
              <TextField label="Підтвердження" type="password" fullWidth margin="dense" value={passwordData.confirm} onChange={e => setPasswordData({...passwordData, confirm: e.target.value})} />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setChangePasswordOpen(false)}>Скасувати</Button>
              <Button onClick={handleChangePassword}>Змінити</Button>
            </DialogActions>
          </Dialog>
        </Box>
      </TabPanel>
    </Container>
  );
};

export default ProfilePage;