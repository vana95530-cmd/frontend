import { useState, useEffect } from 'react';
import {
  Container, Card, Grid, CardMedia, CardContent, Typography, CardActionArea,
  TextField, MenuItem, Button, Box, Slider, InputAdornment, Pagination, CircularProgress, Alert,
  IconButton
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { adService } from '../../services/adService';
import type { Advertisement, AdFilterParams } from '../../types';
import { userService } from '../../services/userService';
import MapView from '../../components/Map/MapView';
import FilterPanel from '../../components/FilterPanel/FilterPanel';
import { Favorite, FavoriteBorder } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

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
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const { user } = useAuth(); // якщо ще немає в компоненті – додайте

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

  useEffect(() => {
    if (user) {
      userService.getFavorites().then(favs => {
        setFavorites(new Set(favs.map((f: any) => f.ad_id)));
      }).catch(console.error);
    }
  }, [user]);

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

  const toggleFavorite = async (adId: number) => {
    if (!user) return;
    const isFav = favorites.has(adId);
    try {
      if (isFav) {
        await userService.removeFromFavorites(adId);
        setFavorites(prev => {
          const next = new Set(prev);
          next.delete(adId);
          return next;
        });
      } else {
        await userService.addToFavorites(adId);
        setFavorites(prev => new Set(prev).add(adId));
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Помилка');
    }
  };

  const paginatedAds = ads.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalPages = Math.ceil(ads.length / itemsPerPage);

  return (
    <Container maxWidth={false} disableGutters sx={{ px: 3, py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Нерухомість у Черкасах
      </Typography>

      <FilterPanel
        filters={filters}
        onFilterChange={handleFilterChange}
        onPriceRangeChange={(min, max) => {
          setPriceRange([min, max]);
          handleFilterChange('min_price', min);
          handleFilterChange('max_price', max);
        }}
        onAreaRangeChange={(min, max) => {
          setAreaRange([min, max]);
          handleFilterChange('min_area', min);
          handleFilterChange('max_area', max);
        }}
        onClear={clearFilters}
        priceRange={priceRange}
        areaRange={areaRange}
      />

      {/* Основний контент: список + карта */}
      <Grid container spacing={2}>
        {/* Ліва частина – список оголошень (на мобільних займає всю ширину) */}
        <Grid item xs={12} md={7}>
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
                                {ad.property_type === 'apartment' ? 'Квартира' :
                                  ad.property_type === 'house' ? 'Будинок' :
                                    ad.property_type === 'commercial' ? 'Комерційна нерухомість' :
                                      ad.property_type} • {ad.district}
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
                        <IconButton
                          sx={{ position: 'absolute', top: 8, right: 8 }}
                          onClick={(e) => {
                            e.stopPropagation(); // щоб не спрацював перехід на оголошення
                            toggleFavorite(ad.ad_id);
                          }}
                        >
                          {favorites.has(ad.ad_id) ? <Favorite color="error" /> : <FavoriteBorder />}
                        </IconButton>
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
        </Grid>

        {/* Права частина – карта (на мобільних зменшується) */}
        <Grid item xs={12} md={5}>
          <Box sx={{
            position: { md: 'sticky' },
            top: 16,
            height: { xs: '50vh', md: 'calc(100vh - 160px)' },
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: 3,
          }}>
            <MapView ads={ads} />
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default HomePage;