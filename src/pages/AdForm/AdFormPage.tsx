import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container, Typography, Grid, TextField, Button, MenuItem, Box, Alert, CircularProgress,
  IconButton, Chip
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { adService } from '../../services/adService';
import type { CreateAdData, AdPhoto } from '../../types';

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
  
  // Існуючі фото (отримані з сервера)
  const [existingPhotos, setExistingPhotos] = useState<AdPhoto[]>([]);
  // Нові файли для завантаження
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  // Прев'ю нових файлів
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  // Індекс головного фото серед усіх (спочатку старі, потім нові)
  const [mainPhotoIndex, setMainPhotoIndex] = useState<number>(0);
  
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
      // Зберігаємо існуючі фото
      setExistingPhotos(ad.photos || []);
      // Знаходимо індекс головного фото серед існуючих
      const mainIdx = ad.photos?.findIndex(p => p.is_main) ?? 0;
      setMainPhotoIndex(mainIdx >= 0 ? mainIdx : 0);
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
    const num = value ? Number(value) : undefined;
    if (num !== undefined && num < 0) return;
    setFormData(prev => ({ ...prev, [name]: num }));
  };

  // Додавання нових файлів
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setNewPhotos(prev => [...prev, ...files]);
      const previews = files.map(file => URL.createObjectURL(file));
      setNewPreviews(prev => [...prev, ...previews]);
    }
  };

  // Видалення нового фото (ще не завантаженого)
  const removeNewPhoto = (index: number) => {
    setNewPhotos(prev => prev.filter((_, i) => i !== index));
    setNewPreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
    // Коригуємо головний індекс, якщо видаляємо фото з newPhotos
    const totalExisting = existingPhotos.length;
    if (mainPhotoIndex === totalExisting + index) {
      setMainPhotoIndex(0);
    } else if (mainPhotoIndex > totalExisting + index) {
      setMainPhotoIndex(prev => prev - 1);
    }
  };

  // Видалення існуючого фото (запит на сервер)
  const removeExistingPhoto = async (photoId: number, index: number) => {
    try {
      await adService.deletePhoto(parseInt(id!), photoId);
      setExistingPhotos(prev => prev.filter(p => p.photo_id !== photoId));
      // Коригуємо головний індекс
      if (mainPhotoIndex === index) {
        setMainPhotoIndex(0);
      } else if (mainPhotoIndex > index) {
        setMainPhotoIndex(prev => prev - 1);
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Помилка видалення фото');
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

      // Завантаження нових фото
      for (let i = 0; i < newPhotos.length; i++) {
        const globalIdx = existingPhotos.length + i;
        const isMain = globalIdx === mainPhotoIndex;
        await adService.uploadPhoto(adId, newPhotos[i], isMain);
      }

      // Якщо головне фото змінилося серед існуючих, потрібно оновити is_main
      // Можна додати endpoint для зміни головного фото, але поки що пропустимо

      // Очищаємо preview
      newPreviews.forEach(url => URL.revokeObjectURL(url));
      setNewPhotos([]);
      setNewPreviews([]);

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
              onKeyDown={(e) => { if (e.key === '-' || e.key === 'e' || e.key === '+') e.preventDefault(); }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Площа, м²" name="area" type="number" value={formData.area || ''} onChange={handleNumberChange}
              inputProps={{ min: 0 }}
              onKeyDown={(e) => { if (e.key === '-' || e.key === 'e' || e.key === '+') e.preventDefault(); }} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth label="Кількість кімнат" name="rooms" type="number" value={formData.rooms || ''} onChange={handleNumberChange}
              inputProps={{ min: 0 }}
              onKeyDown={(e) => { if (e.key === '-' || e.key === 'e' || e.key === '+') e.preventDefault(); }} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth label="Поверх" name="floor" type="number" value={formData.floor || ''} onChange={handleNumberChange}
              inputProps={{ min: 0 }}
              onKeyDown={(e) => { if (e.key === '-' || e.key === 'e' || e.key === '+') e.preventDefault(); }} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth label="Всього поверхів" name="total_floors" type="number" value={formData.total_floors || ''} onChange={handleNumberChange}
              inputProps={{ min: 0 }}
              onKeyDown={(e) => { if (e.key === '-' || e.key === 'e' || e.key === '+') e.preventDefault(); }} />
          </Grid>

          {/* Блок фото */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>Фотографії</Typography>
            
            {/* Існуючі фото (тільки при редагуванні) */}
            {isEdit && existingPhotos.length > 0 && (
              <>
                <Typography variant="body2" color="text.secondary" gutterBottom>Поточні фото:</Typography>
                <Grid container spacing={1} sx={{ mb: 2 }}>
                  {existingPhotos.map((photo, idx) => (
                    <Grid item xs={4} sm={3} md={2} key={photo.photo_id}>
                      <Box
                        sx={{
                          position: 'relative',
                          border: mainPhotoIndex === idx ? '2px solid blue' : '1px solid #ccc',
                          borderRadius: 1,
                          overflow: 'hidden',
                          cursor: 'pointer',
                        }}
                        onClick={() => setMainPhotoIndex(idx)}
                      >
                        <img
                          src={`http://localhost:5000${photo.url}`}
                          alt=""
                          style={{ width: '100%', height: 100, objectFit: 'cover', display: 'block' }}
                        />
                        <IconButton
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            bgcolor: 'rgba(255,255,255,0.8)',
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            removeExistingPhoto(photo.photo_id, idx);
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                        {mainPhotoIndex === idx && (
                          <Chip label="Головне" size="small" sx={{ position: 'absolute', bottom: 0, left: 0, m: 0.5 }} />
                        )}
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </>
            )}

            {/* Нові фото (прев'ю) */}
            {newPreviews.length > 0 && (
              <>
                <Typography variant="body2" color="text.secondary" gutterBottom>Нові фото:</Typography>
                <Grid container spacing={1} sx={{ mb: 2 }}>
                  {newPreviews.map((preview, idx) => {
                    const globalIdx = existingPhotos.length + idx;
                    return (
                      <Grid item xs={4} sm={3} md={2} key={`new-${idx}`}>
                        <Box
                          sx={{
                            position: 'relative',
                            border: mainPhotoIndex === globalIdx ? '2px solid blue' : '1px solid #ccc',
                            borderRadius: 1,
                            overflow: 'hidden',
                            cursor: 'pointer',
                          }}
                          onClick={() => setMainPhotoIndex(globalIdx)}
                        >
                          <img
                            src={preview}
                            alt=""
                            style={{ width: '100%', height: 100, objectFit: 'cover', display: 'block' }}
                          />
                          <IconButton
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: 0,
                              right: 0,
                              bgcolor: 'rgba(255,255,255,0.8)',
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNewPhoto(idx);
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                          {mainPhotoIndex === globalIdx && (
                            <Chip label="Головне" size="small" sx={{ position: 'absolute', bottom: 0, left: 0, m: 0.5 }} />
                          )}
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              </>
            )}

            <Button variant="outlined" component="label" sx={{ mt: 1 }}>
              {isEdit ? 'Додати фото' : 'Вибрати фото'}
              <input type="file" hidden multiple accept="image/*" onChange={handleFileChange} />
            </Button>
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