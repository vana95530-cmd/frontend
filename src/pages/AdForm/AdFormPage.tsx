import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container, Typography, Grid, TextField, Button, MenuItem, Box, Alert, CircularProgress
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { adService } from '../../services/adService';
import type { CreateAdData } from '../../types';

const propertyTypes = [
  { value: 'apartment', label: 'Квартира' },
  { value: 'house', label: 'Будинок' },
  { value: 'commercial', label: 'Комерційна' },
  { value: 'land', label: 'Земля' },
];
const districts = ['Центр', 'Придніпровський', 'Соснівський', 'Митниця', 'Дахнівка'];

const AdFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateAdData>({
    title: '',
    description: '',
    property_type: 'apartment',
    district: '',
    address: '',
    price: 0,
    area: undefined,
    rooms: undefined,
    floor: undefined,
    total_floors: undefined,
  });
  const [photos, setPhotos] = useState<File[]>([]);
  const [mainPhotoIndex, setMainPhotoIndex] = useState<number>(0);

  useEffect(() => {
    if (isEdit && id) {
      fetchAd(parseInt(id));
    }
  }, [id, isEdit]);

  const fetchAd = async (adId: number) => {
    try {
      const ad = await adService.getAdById(adId);
      if (ad.user_id !== user?.user_id) {
        setError('Ви не можете редагувати це оголошення');
        return;
      }
      setFormData({
        title: ad.title,
        description: ad.description,
        property_type: ad.property_type,
        district: ad.district,
        address: ad.address || '',
        price: ad.price,
        area: ad.area,
        rooms: ad.rooms,
        floor: ad.floor,
        total_floors: ad.total_floors,
      });
    } catch (err: any) {
      setError('Не вдалося завантажити оголошення');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value ? Number(value) : undefined }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPhotos(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      let adId: number;
      if (isEdit && id) {
        await adService.updateAd(parseInt(id), formData);
        adId = parseInt(id);
      } else {
        const res = await adService.createAd(formData);
        adId = res.ad_id;
      }

      // Завантаження фото
      for (let i = 0; i < photos.length; i++) {
        const isMain = i === mainPhotoIndex;
        await adService.uploadPhoto(adId, photos[i], isMain);
      }

      navigate(`/ads/${adId}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Помилка збереження');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        {isEdit ? 'Редагувати оголошення' : 'Створити оголошення'}
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField fullWidth label="Заголовок" name="title" value={formData.title} onChange={handleChange} required />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Опис" name="description" multiline rows={4} value={formData.description} onChange={handleChange} required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField select fullWidth label="Тип нерухомості" name="property_type" value={formData.property_type} onChange={handleChange} required>
              {propertyTypes.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField select fullWidth label="Район" name="district" value={formData.district} onChange={handleChange} required>
              {districts.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Адреса" name="address" value={formData.address} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Ціна, $" name="price" type="number" value={formData.price} onChange={handleNumberChange} required
              inputProps={{ min: 0 }}
              onKeyDown={(e) => {
                if (e.key === '-' || e.key === 'e' || e.key === '+') {
                  e.preventDefault();
                }
              }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Площа, м²" name="area" type="number" value={formData.area || ''} onChange={handleNumberChange} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth label="Кількість кімнат" name="rooms" type="number" value={formData.rooms || ''} onChange={handleNumberChange} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth label="Поверх" name="floor" type="number" value={formData.floor || ''} onChange={handleNumberChange} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth label="Всього поверхів" name="total_floors" type="number" value={formData.total_floors || ''} onChange={handleNumberChange} />
          </Grid>
          <Grid item xs={12}>
            <Button variant="outlined" component="label">
              Вибрати фото
              <input type="file" hidden multiple accept="image/*" onChange={handleFileChange} />
            </Button>
            {photos.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2">Виберіть головне фото:</Typography>
                <Grid container spacing={1}>
                  {photos.map((file, idx) => (
                    <Grid item key={idx}>
                      <img
                        src={URL.createObjectURL(file)}
                        alt="preview"
                        style={{ width: 100, height: 100, objectFit: 'cover', border: mainPhotoIndex === idx ? '2px solid blue' : 'none' }}
                        onClick={() => setMainPhotoIndex(idx)}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" variant="contained" size="large" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : (isEdit ? 'Зберегти зміни' : 'Опублікувати')}
            </Button>
            <Button variant="text" onClick={() => navigate(-1)} sx={{ ml: 2 }}>Скасувати</Button>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default AdFormPage;