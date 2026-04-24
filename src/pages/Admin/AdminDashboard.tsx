import { useState, useEffect } from 'react';
import {
  Container, Typography, Tabs, Tab, Box, CircularProgress, Alert,
  Card, CardContent, CardActions, Button, Chip, Grid,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from '@mui/material';
import { adminService } from '../../services/adminService';
import type { PendingAd, UserForAdmin, AdminLogEntry } from '../../services/adminService';
import { useNavigate } from 'react-router-dom';

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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [pendingAds, setPendingAds] = useState<PendingAd[]>([]);
  const [loadingAds, setLoadingAds] = useState(false);
  const [users, setUsers] = useState<UserForAdmin[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [logs, setLogs] = useState<AdminLogEntry[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectAdId, setRejectAdId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    if (tabValue === 0) fetchPendingAds();
    else if (tabValue === 1) fetchUsers();
    else if (tabValue === 2) fetchLogs();
  }, [tabValue]);

  const fetchPendingAds = async () => {
    setLoadingAds(true);
    try {
      setPendingAds(await adminService.getPendingAds());
    } catch (err: any) {
      setError(err.response?.data?.error || 'Помилка');
    } finally {
      setLoadingAds(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      setUsers(await adminService.getUsers());
    } catch (err: any) {
      setError(err.response?.data?.error || 'Помилка');
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      setLogs(await adminService.getLogs());
    } catch (err: any) {
      setError(err.response?.data?.error || 'Помилка');
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleApprove = async (adId: number) => {
    try {
      await adminService.approveAd(adId);
      setPendingAds(prev => prev.filter(ad => ad.ad_id !== adId));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Помилка');
    }
  };

  const openRejectDialog = (adId: number) => {
    setRejectAdId(adId);
    setRejectReason('');
    setRejectDialogOpen(true);
  };

  const handleReject = async () => {
    if (!rejectAdId) return;
    try {
      await adminService.rejectAd(rejectAdId, rejectReason);
      setPendingAds(prev => prev.filter(ad => ad.ad_id !== rejectAdId));
      setRejectDialogOpen(false);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Помилка');
    }
  };

  const handleBlock = async (userId: number) => {
    try {
      await adminService.blockUser(userId);
      setUsers(prev => prev.map(u => u.user_id === userId ? { ...u, status: 'blocked' } : u));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Помилка');
    }
  };

  const handleUnblock = async (userId: number) => {
    try {
      await adminService.unblockUser(userId);
      setUsers(prev => prev.map(u => u.user_id === userId ? { ...u, status: 'active' } : u));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Помилка');
    }
  };

  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Адміністративна панель</Typography>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab label="Модерація оголошень" />
          <Tab label="Користувачі" />
          <Tab label="Журнал дій" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        {loadingAds ? <CircularProgress /> : (
          <Grid container spacing={2}>
            {pendingAds.length === 0 ? <Typography>Немає оголошень на модерації</Typography> : (
              pendingAds.map(ad => (
                <Grid item xs={12} sm={6} md={4} key={ad.ad_id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">{ad.title}</Typography>
                      <Typography>${ad.price} · {ad.district}</Typography>
                      <Chip label="На модерації" size="small" />
                    </CardContent>
                    <CardActions>
                      <Button size="small" color="success" onClick={() => handleApprove(ad.ad_id)}>Схвалити</Button>
                      <Button size="small" color="error" onClick={() => openRejectDialog(ad.ad_id)}>Відхилити</Button>
                      <Button size="small" onClick={() => navigate(`/ads/${ad.ad_id}`)}>Переглянути</Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        )}
        <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)}>
          <DialogTitle>Причина відхилення</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              label="Вкажіть причину (необов'язково)"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRejectDialogOpen(false)}>Скасувати</Button>
            <Button onClick={handleReject} color="error">Відхилити</Button>
          </DialogActions>
        </Dialog>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {loadingUsers ? <CircularProgress /> : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Ім'я</TableCell>
                  <TableCell>Роль</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell>Дії</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map(user => (
                  <TableRow key={user.user_id}>
                    <TableCell>{user.user_id}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.full_name}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      <Chip label={user.status} color={user.status === 'active' ? 'success' : 'error'} size="small" />
                    </TableCell>
                    <TableCell>
                      {user.role !== 'admin' && (
                        user.status === 'active' ? (
                          <Button size="small" color="warning" onClick={() => handleBlock(user.user_id)}>Заблокувати</Button>
                        ) : (
                          <Button size="small" color="primary" onClick={() => handleUnblock(user.user_id)}>Розблокувати</Button>
                        )
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {loadingLogs ? <CircularProgress /> : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Адміністратор</TableCell>
                  <TableCell>Дія</TableCell>
                  <TableCell>Тип цілі</TableCell>
                  <TableCell>Ціль ID</TableCell>
                  <TableCell>Деталі</TableCell>
                  <TableCell>Дата</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map(log => (
                  <TableRow key={log.log_id}>
                    <TableCell>{log.log_id}</TableCell>
                    <TableCell>{log.admin_id}</TableCell>
                    <TableCell>{log.action_type}</TableCell>
                    <TableCell>{log.target_type}</TableCell>
                    <TableCell>{log.target_id}</TableCell>
                    <TableCell>{JSON.stringify(log.details)}</TableCell>
                    <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </TabPanel>
    </Container>
  );
};

export default AdminDashboard;