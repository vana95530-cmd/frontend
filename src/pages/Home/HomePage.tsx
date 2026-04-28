import { Typography } from '@mui/material';
import MapView from '../../components/Map/MapView';

const HomePage = () => {
  return (
    <>
      <Typography variant="h4" gutterBottom>
        Нерухомість у Черкасах
      </Typography>
      <MapView />
      {/* Тут пізніше з'явиться список оголошень */}
    </>
  );
};

export default HomePage;