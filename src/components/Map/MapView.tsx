import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Box, Button } from '@mui/material';

// Фікс іконок Leaflet
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

interface AdLocation {
  ad_id: number;
  title: string;
  price: number;
  area?: number | null;
  rooms?: number | null;
  district: string;
  latitude?: number | null;
  longitude?: number | null;
  property_type: string;
}

interface MapViewProps {
  ads: AdLocation[];
}

const MapView: React.FC<MapViewProps> = ({ ads }) => {
  const navigate = useNavigate();

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
                <div style={{ minWidth: 150 }}>
                  <b>{ad.title}</b><br />
                  ${ad.price.toLocaleString()}<br />
                  {ad.area != null && `${ad.area} м², `}
                  {ad.rooms != null && `${ad.rooms} кімн.`}
                  <br />
                  {ad.district}
                  <br />
                  <Button
                    variant="contained"
                    size="small"
                    sx={{ mt: 1 }}
                    onClick={() => navigate(`/ads/${ad.ad_id}`)}
                  >
                    Переглянути
                  </Button>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </Box>
  );
};

export default MapView;