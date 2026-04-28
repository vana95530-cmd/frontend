import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import apiClient from '../../api/client';
import { CircularProgress, Box, Typography } from '@mui/material';

// Виправлення стандартних іконок Leaflet (без цього маркери не відображаються)
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});


L.Icon.Default.mergeOptions({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});

interface AdLocation {
  ad_id: number;
  title: string;
  price: number;
  area: number | null;
  rooms: number | null;
  district: string;
  latitude: number;
  longitude: number;
  property_type: string;
}

const MapView = () => {
  const [ads, setAds] = useState<AdLocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const response = await apiClient.get('/map/ads');
        setAds(response.data);
      } catch (error) {
        console.error('Помилка завантаження даних для карти:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAds();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ height: 500, width: '100%', borderRadius: 2, overflow: 'hidden', mt: 3 }}>
      <MapContainer
        center={[49.4449, 32.0581]} // центр Черкас
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {ads.map((ad) => (
          <Marker key={ad.ad_id} position={[ad.latitude, ad.longitude]}>
            <Popup>
              <Typography variant="subtitle2" fontWeight="bold">{ad.title}</Typography>
              <Typography variant="body2">{ad.price.toLocaleString()} грн</Typography>
              {ad.area && <Typography variant="body2">{ad.area} м²</Typography>}
              <Typography variant="body2">Кімнат: {ad.rooms}</Typography>
              <Typography variant="body2">Район: {ad.district}</Typography>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </Box>
  );
};

export default MapView;