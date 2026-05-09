import { useState } from 'react';
import {
  Box, Button, Popover, Typography, TextField, MenuItem,
  Slider, InputAdornment, IconButton, Chip
} from '@mui/material';
import { KeyboardArrowDown, Close } from '@mui/icons-material';
import type { AdFilterParams } from '../../types';

const districts = ['Центр', 'Придніпровський', 'Соснівський', 'Митниця', 'Дахнівка'];
const propertyTypes = [
  { value: 'apartment', label: 'Квартири' },
  { value: 'house', label: 'Будинки' },
  { value: 'commercial', label: 'Комерційна нерухомість' },
];

interface FilterPanelProps {
  filters: AdFilterParams;
  onFilterChange: (key: keyof AdFilterParams, value: any) => void;
  onPriceRangeChange: (min: number, max: number) => void;
  onAreaRangeChange: (min: number, max: number) => void;
  onClear: () => void;
  priceRange: number[];
  areaRange: number[];
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFilterChange,
  onPriceRangeChange,
  onAreaRangeChange,
  onClear,
  priceRange,
  areaRange,
}) => {
  // Стан для відкриття popover'ів
  const [anchorPropType, setAnchorPropType] = useState<HTMLButtonElement | null>(null);
  const [anchorDistrict, setAnchorDistrict] = useState<HTMLButtonElement | null>(null);
  const [anchorRooms, setAnchorRooms] = useState<HTMLButtonElement | null>(null);
  const [anchorPrice, setAnchorPrice] = useState<HTMLButtonElement | null>(null);
  const [anchorArea, setAnchorArea] = useState<HTMLButtonElement | null>(null);

  // Локальні стани для значень у popover'ах (щоб не оновлювати глобальні одразу)
  const [localPropType, setLocalPropType] = useState<string>(filters.property_type || '');
  const [localDistrict, setLocalDistrict] = useState<string>(filters.district || '');
  const [localRooms, setLocalRooms] = useState<string>(filters.rooms ? String(filters.rooms) : '');
  const [localPriceMin, setLocalPriceMin] = useState<number>(priceRange[0]);
  const [localPriceMax, setLocalPriceMax] = useState<number>(priceRange[1]);
  const [localAreaMin, setLocalAreaMin] = useState<number>(areaRange[0]);
  const [localAreaMax, setLocalAreaMax] = useState<number>(areaRange[1]);

  // Відкриття/закриття popover'ів
  const handleOpen = (setter: React.Dispatch<React.SetStateAction<HTMLButtonElement | null>>) =>
    (event: React.MouseEvent<HTMLButtonElement>) => {
      setter(event.currentTarget);
    };

  const handleClose = (setter: React.Dispatch<React.SetStateAction<HTMLButtonElement | null>>) => () => {
    setter(null);
  };

  // Застосування фільтра з popover'у
  const applyPropType = () => {
    onFilterChange('property_type', localPropType);
    handleClose(setAnchorPropType)();
  };

  const applyDistrict = () => {
    onFilterChange('district', localDistrict);
    handleClose(setAnchorDistrict)();
  };

  const applyRooms = () => {
    onFilterChange('rooms', localRooms ? Number(localRooms) : undefined);
    handleClose(setAnchorRooms)();
  };

  const applyPrice = () => {
    onPriceRangeChange(localPriceMin, localPriceMax);
    handleClose(setAnchorPrice)();
  };

  const applyArea = () => {
    onAreaRangeChange(localAreaMin, localAreaMax);
    handleClose(setAnchorArea)();
  };

  // Скидання локальних значень при відкритті popover'у (щоб показати поточні)
  const handleOpenPropType = (e: React.MouseEvent<HTMLButtonElement>) => {
    setLocalPropType(filters.property_type || '');
    setAnchorPropType(e.currentTarget);
  };

  const handleOpenDistrict = (e: React.MouseEvent<HTMLButtonElement>) => {
    setLocalDistrict(filters.district || '');
    setAnchorDistrict(e.currentTarget);
  };

  const handleOpenRooms = (e: React.MouseEvent<HTMLButtonElement>) => {
    setLocalRooms(filters.rooms ? String(filters.rooms) : '');
    setAnchorRooms(e.currentTarget);
  };

  const handleOpenPrice = (e: React.MouseEvent<HTMLButtonElement>) => {
    setLocalPriceMin(priceRange[0]);
    setLocalPriceMax(priceRange[1]);
    setAnchorPrice(e.currentTarget);
  };

  const handleOpenArea = (e: React.MouseEvent<HTMLButtonElement>) => {
    setLocalAreaMin(areaRange[0]);
    setLocalAreaMax(areaRange[1]);
    setAnchorArea(e.currentTarget);
  };

  // Формування тексту для кнопок, що показують активні фільтри
  const propTypeLabel = propertyTypes.find(pt => pt.value === filters.property_type)?.label || 'Тип нерухомості';
  const districtLabel = filters.district || 'Район';
  const roomsLabel = filters.rooms ? `${filters.rooms} кімн.` : 'Кімнати';
  const priceLabel = `$${priceRange[0].toLocaleString()} – $${priceRange[1].toLocaleString()}`;
  const areaLabel = `${areaRange[0]} – ${areaRange[1]} м²`;

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2, alignItems: 'center' }}>
      {/* Тип нерухомості */}
      <Button
        variant="outlined"
        endIcon={<KeyboardArrowDown />}
        onClick={handleOpenPropType}
        sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 500, bgcolor: 'white', borderColor: '#ccc', color: '#333' }}
      >
        {propTypeLabel}
      </Button>
      <Popover
        open={Boolean(anchorPropType)}
        anchorEl={anchorPropType}
        onClose={handleClose(setAnchorPropType)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box sx={{ p: 2, width: 200 }}>
          <TextField
            select
            fullWidth
            label="Тип нерухомості"
            value={localPropType}
            onChange={(e) => setLocalPropType(e.target.value)}
          >
            <MenuItem value="">Всі</MenuItem>
            {propertyTypes.map(pt => (
              <MenuItem key={pt.value} value={pt.value}>{pt.label}</MenuItem>
            ))}
          </TextField>
          <Button variant="contained" fullWidth onClick={applyPropType} sx={{ mt: 1 }}>Застосувати</Button>
        </Box>
      </Popover>

      {/* Район */}
      <Button
        variant="outlined"
        endIcon={<KeyboardArrowDown />}
        onClick={handleOpenDistrict}
        sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 500, bgcolor: 'white', borderColor: '#ccc', color: '#333' }}
      >
        {districtLabel}
      </Button>
      <Popover
        open={Boolean(anchorDistrict)}
        anchorEl={anchorDistrict}
        onClose={handleClose(setAnchorDistrict)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box sx={{ p: 2, width: 200 }}>
          <TextField
            select
            fullWidth
            label="Район"
            value={localDistrict}
            onChange={(e) => setLocalDistrict(e.target.value)}
          >
            <MenuItem value="">Всі райони</MenuItem>
            {districts.map(d => (
              <MenuItem key={d} value={d}>{d}</MenuItem>
            ))}
          </TextField>
          <Button variant="contained" fullWidth onClick={applyDistrict} sx={{ mt: 1 }}>Застосувати</Button>
        </Box>
      </Popover>

      {/* Кімнати */}
      <Button
        variant="outlined"
        endIcon={<KeyboardArrowDown />}
        onClick={handleOpenRooms}
        sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 500, bgcolor: 'white', borderColor: '#ccc', color: '#333' }}
      >
        {roomsLabel}
      </Button>
      <Popover
        open={Boolean(anchorRooms)}
        anchorEl={anchorRooms}
        onClose={handleClose(setAnchorRooms)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box sx={{ p: 2, width: 200 }}>
          <TextField
            select
            fullWidth
            label="Кількість кімнат"
            value={localRooms}
            onChange={(e) => setLocalRooms(e.target.value)}
          >
            <MenuItem value="">Будь-яка</MenuItem>
            {[1,2,3,4,5].map(n => (
              <MenuItem key={n} value={String(n)}>{n} кімн.</MenuItem>
            ))}
          </TextField>
          <Button variant="contained" fullWidth onClick={applyRooms} sx={{ mt: 1 }}>Застосувати</Button>
        </Box>
      </Popover>

      {/* Ціна */}
      <Button
        variant="outlined"
        endIcon={<KeyboardArrowDown />}
        onClick={handleOpenPrice}
        sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 500, bgcolor: 'white', borderColor: '#ccc', color: '#333' }}
      >
        {priceLabel}
      </Button>
      <Popover
        open={Boolean(anchorPrice)}
        anchorEl={anchorPrice}
        onClose={handleClose(setAnchorPrice)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box sx={{ p: 2, width: 300 }}>
          <Typography gutterBottom fontWeight={500}>Ціна, $</Typography>
          <Slider
            value={[localPriceMin, localPriceMax]}
            onChange={(_, val) => {
              const [min, max] = val as number[];
              setLocalPriceMin(min);
              setLocalPriceMax(max);
            }}
            min={0}
            max={200000}
            step={1000}
            valueLabelDisplay="auto"
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <TextField
              size="small"
              value={localPriceMin}
              onChange={(e) => setLocalPriceMin(Number(e.target.value))}
              InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
              sx={{ width: '45%' }}
            />
            <Typography sx={{ alignSelf: 'center' }}>–</Typography>
            <TextField
              size="small"
              value={localPriceMax}
              onChange={(e) => setLocalPriceMax(Number(e.target.value))}
              InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
              sx={{ width: '45%' }}
            />
          </Box>
          <Button variant="contained" fullWidth onClick={applyPrice} sx={{ mt: 2 }}>Застосувати</Button>
        </Box>
      </Popover>

      {/* Площа */}
      <Button
        variant="outlined"
        endIcon={<KeyboardArrowDown />}
        onClick={handleOpenArea}
        sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 500, bgcolor: 'white', borderColor: '#ccc', color: '#333' }}
      >
        {areaLabel}
      </Button>
      <Popover
        open={Boolean(anchorArea)}
        anchorEl={anchorArea}
        onClose={handleClose(setAnchorArea)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box sx={{ p: 2, width: 300 }}>
          <Typography gutterBottom fontWeight={500}>Площа, м²</Typography>
          <Slider
            value={[localAreaMin, localAreaMax]}
            onChange={(_, val) => {
              const [min, max] = val as number[];
              setLocalAreaMin(min);
              setLocalAreaMax(max);
            }}
            min={0}
            max={200}
            step={5}
            valueLabelDisplay="auto"
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <TextField
              size="small"
              value={localAreaMin}
              onChange={(e) => setLocalAreaMin(Number(e.target.value))}
              InputProps={{ endAdornment: <InputAdornment position="end">м²</InputAdornment> }}
              sx={{ width: '45%' }}
            />
            <Typography sx={{ alignSelf: 'center' }}>–</Typography>
            <TextField
              size="small"
              value={localAreaMax}
              onChange={(e) => setLocalAreaMax(Number(e.target.value))}
              InputProps={{ endAdornment: <InputAdornment position="end">м²</InputAdornment> }}
              sx={{ width: '45%' }}
            />
          </Box>
          <Button variant="contained" fullWidth onClick={applyArea} sx={{ mt: 2 }}>Застосувати</Button>
        </Box>
      </Popover>

      {/* Кнопка очищення */}
      {Object.values(filters).some(v => v !== undefined && v !== '') && (
        <Button
          variant="text"
          onClick={onClear}
          sx={{ ml: 'auto', textTransform: 'none', color: '#1976d2' }}
        >
          Очистити фільтри
        </Button>
      )}
    </Box>
  );
};

export default FilterPanel;