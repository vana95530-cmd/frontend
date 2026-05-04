import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Box } from '@mui/material';

// Фікс іконок (залишаємо без змін)
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});

// Оновлений інтерфейс з опціональними полями
interface AdLocation {
  ad_id: number;
  title: string;
  price: number;
  area?: number | null;      // тепер не обов’язкове
  rooms?: number | null;     // тепер не обов’язкове
  district: string;
  latitude?: number | null;  // може бути відсутнім
  longitude?: number | null; // може бути відсутнім
  property_type: string;
}

interface MapViewProps {
  ads: AdLocation[];
}

const MapView: React.FC<MapViewProps> = ({ ads }) => {
  return (
    <Box sx={{ height: '100%', width: '100%', borderRadius: 2, overflow: 'hidden' }}>
      <MapContainer
        center={[49.4449, 32.0581]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {ads
          .filter(ad => ad.latitude != null && ad.longitude != null)
          .map((ad) => (
            <Marker key={ad.ad_id} position={[ad.latitude!, ad.longitude!]}>
              <Popup>
                <b>{ad.title}</b><br />
                ${ad.price.toLocaleString()}<br />
                {ad.area != null && `${ad.area} м², `}
                {ad.rooms != null && `${ad.rooms} кімн.`}
                <br />
                {ad.district}
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </Box>
  );
};

export default MapView;