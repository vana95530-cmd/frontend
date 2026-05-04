import { useState, useEffect } from 'react';
import {
  Container, Card, Grid, CardMedia, CardContent, Typography, CardActionArea,
  TextField, MenuItem, Button, Box, Slider, InputAdornment, Pagination, CircularProgress, Alert
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { adService } from '../../services/adService';
import type { Advertisement, AdFilterParams } from '../../types';
import { userService } from '../../services/userService';
import MapView from '../../components/Map/MapView';

const districts = ['Центр', 'Придніпровський', 'Соснівський', 'Митниця', 'Дахнівка'];
const propertyTypes = [
  { value: 'apartment', label: 'Квартира' },
  { value: 'house', label: 'Будинок' },
  { value: 'commercial', label: 'Комерційна' },
  { value: 'land', label: 'Земля' },
];

const HomePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AdFilterParams>({
    property_type: '',
    district: '',
    min_price: undefined,
    max_price: undefined,
    min_area: undefined,
    max_area: undefined,
    rooms: undefined,
  });
  const [priceRange, setPriceRange] = useState<number[]>([0, 200000]);
  const [areaRange, setAreaRange] = useState<number[]>([0, 200]);
  const [page, setPage] = useState(1);
  const itemsPerPage = 9;

  // Обробка параметрів пошуку з історії
  useEffect(() => {
    const state = location.state as any;
    if (state?.searchParams) {
      const params = state.searchParams;
      const newFilters: AdFilterParams = {
        property_type: params.property_type || '',
        district: params.district || '',
        min_price: params.min_price,
        max_price: params.max_price,
        min_area: params.min_area,
        max_area: params.max_area,
        rooms: params.rooms,
      };
      setFilters(newFilters);
      if (params.min_price !== undefined && params.max_price !== undefined) {
        setPriceRange([params.min_price, params.max_price]);
      } else if (params.min_price !== undefined) {
        setPriceRange([params.min_price, priceRange[1]]);
      } else if (params.max_price !== undefined) {
        setPriceRange([priceRange[0], params.max_price]);
      }
      if (params.min_area !== undefined && params.max_area !== undefined) {
        setAreaRange([params.min_area, params.max_area]);
      } else if (params.min_area !== undefined) {
        setAreaRange([params.min_area, areaRange[1]]);
      } else if (params.max_area !== undefined) {
        setAreaRange([areaRange[0], params.max_area]);
      }
      // Очищаємо state, щоб при оновленні сторінки не застосовувалось знову
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    fetchAds();
  }, [filters]);

  const fetchAds = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adService.getAds(filters);
      setAds(data);
      if (Object.values(filters).some(v => v !== undefined && v !== '')) {
        userService.saveSearchHistory(filters).catch(console.error);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Помилка завантаження оголошень');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof AdFilterParams, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handlePriceChange = (_: Event, newValue: number | number[]) => {
    const [min, max] = newValue as number[];
    setPriceRange([min, max]);
    handleFilterChange('min_price', min);
    handleFilterChange('max_price', max);
  };

  const handleAreaChange = (_: Event, newValue: number | number[]) => {
    const [min, max] = newValue as number[];
    setAreaRange([min, max]);
    handleFilterChange('min_area', min);
    handleFilterChange('max_area', max);
  };

  const clearFilters = () => {
    setFilters({
      property_type: '',
      district: '',
      min_price: undefined,
      max_price: undefined,
      min_area: undefined,
      max_area: undefined,
      rooms: undefined,
    });
    setPriceRange([0, 200000]);
    setAreaRange([0, 200]);
    setPage(1);
  };

  const paginatedAds = ads.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalPages = Math.ceil(ads.length / itemsPerPage);

  return (
    <Container maxWidth={false} disableGutters sx={{ px: 3, py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Нерухомість у Черкасах
      </Typography>

      <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={2}>
            <TextField select fullWidth label="Тип нерухомості" value={filters.property_type}
              onChange={(e) => handleFilterChange('property_type', e.target.value)}>
              <MenuItem value="">Всі</MenuItem>
              {propertyTypes.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField select fullWidth label="Район" value={filters.district}
              onChange={(e) => handleFilterChange('district', e.target.value)}>
              <MenuItem value="">Всі</MenuItem>
              {districts.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField select fullWidth label="Кількість кімнат" value={filters.rooms || ''}
              onChange={(e) => handleFilterChange('rooms', e.target.value ? Number(e.target.value) : undefined)}>
              <MenuItem value="">Будь-яка</MenuItem>
              {[1, 2, 3, 4, 5].map(n => <MenuItem key={n} value={n}>{n}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography gutterBottom>Ціна, $</Typography>
            <Slider value={priceRange} onChange={handlePriceChange} valueLabelDisplay="auto" min={0} max={200000} step={1000} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <TextField size="small" value={priceRange[0]}
                onChange={(e) => { const val = Number(e.target.value); setPriceRange([val, priceRange[1]]); handleFilterChange('min_price', val); }}
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} />
              <TextField size="small" value={priceRange[1]}
                onChange={(e) => { const val = Number(e.target.value); setPriceRange([priceRange[0], val]); handleFilterChange('max_price', val); }}
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} />
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography gutterBottom>Площа, м²</Typography>
            <Slider value={areaRange} onChange={handleAreaChange} valueLabelDisplay="auto" min={0} max={200} step={5} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <TextField size="small" value={areaRange[0]}
                onChange={(e) => { const val = Number(e.target.value); setAreaRange([val, areaRange[1]]); handleFilterChange('min_area', val); }}
                InputProps={{ endAdornment: <InputAdornment position="end">м²</InputAdornment> }} />
              <TextField size="small" value={areaRange[1]}
                onChange={(e) => { const val = Number(e.target.value); setAreaRange([areaRange[0], val]); handleFilterChange('max_area', val); }}
                InputProps={{ endAdornment: <InputAdornment position="end">м²</InputAdornment> }} />
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Button variant="outlined" onClick={clearFilters}>Очистити фільтри</Button>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
        <Box sx={{ flex: 1, overflowY: 'auto', pr: 1 }}>
          {loading ? (
            <Box display="flex" justifyContent="center" my={4}><CircularProgress /></Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : ads.length === 0 ? (
            <Typography variant="h6" align="center">Немає оголошень</Typography>
          ) : (
            <>
              <Grid container spacing={2}>
                {paginatedAds.map(ad => (
                  <Grid item xs={12} key={ad.ad_id}>
                    <Card>
                      <CardActionArea onClick={() => navigate(`/ads/${ad.ad_id}`)}>
                        <Grid container>
                          <Grid item xs={4}>
                            <CardMedia
                              component="img"
                              height="140"
                              image={ad.main_photo ? `http://localhost:5000${ad.main_photo}` : '/placeholder.jpg'}
                              alt={ad.title}
                            />
                          </Grid>
                          <Grid item xs={8}>
                            <CardContent>
                              <Typography gutterBottom variant="h6" component="div">
                                {ad.title}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {ad.property_type === 'apartment' ? 'Квартира' : ad.property_type} • {ad.district}
                              </Typography>
                              <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                                ${ad.price.toLocaleString()}
                              </Typography>
                              <Typography variant="body2">
                                {ad.area} м² • {ad.rooms} кімн.
                              </Typography>
                            </CardContent>
                          </Grid>
                        </Grid>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              {totalPages > 1 && (
                <Box display="flex" justifyContent="center" mt={2} mb={2}>
                  <Pagination count={totalPages} page={page} onChange={(_, val) => setPage(val)} color="primary" />
                </Box>
              )}
            </>
          )}
        </Box>

        <Box sx={{
          width: '45%',
          position: 'sticky',
          top: 16,
          height: 'calc(100vh - 350px)', 
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: 3,
        }}>
          <MapView ads={ads} />
        </Box>
      </Box>
    </Container>
  );
};

export default HomePage;