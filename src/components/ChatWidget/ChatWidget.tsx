import { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, TextField, Button, Paper, IconButton,
  CircularProgress, Alert
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { chatService } from '../../services/chatService';
import { useAuth } from '../../context/AuthContext';
import type { Message } from '../../types';

interface ChatWidgetProps {
  partnerId: number;
  adId: number;       // 0 для адмін-чату
  partnerName: string;
  onClose: () => void;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ partnerId, adId, partnerName, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollInterval = useRef<number | null>(null);

  const fetchMessages = async () => {
    try {
      const msgs = await chatService.getMessages(partnerId, adId);
      setMessages(msgs);
      // Позначаємо непрочитані як прочитані
      msgs.forEach(m => {
        if (m.receiver_id === user?.user_id && !m.is_read) {
          chatService.markAsRead(m.message_id).catch(console.error);
        }
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Помилка завантаження');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    pollInterval.current = window.setInterval(fetchMessages, 5000);
    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current);
    };
  }, [adId, partnerId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMsg.trim() || !user) return;
    try {
      await chatService.sendMessage(partnerId, adId, newMsg.trim());
      setNewMsg('');
      fetchMessages();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Помилка надсилання');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Paper elevation={4} sx={{ width: 350, height: 450, display: 'flex', flexDirection: 'column', position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
      <Box sx={{ p: 1, bgcolor: 'primary.main', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle1">{partnerName}</Typography>
        <IconButton size="small" onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      <Box sx={{ flex: 1, overflowY: 'auto', p: 1 }}>
        {loading && <CircularProgress size={24} />}
        {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}
        {messages.map(msg => (
          <Box key={msg.message_id} sx={{ mb: 1, textAlign: msg.sender_id === user?.user_id ? 'right' : 'left' }}>
            <Paper
              elevation={1}
              sx={{
                p: 1,
                display: 'inline-block',
                maxWidth: '80%',
                bgcolor: msg.sender_id === user?.user_id ? 'primary.light' : 'grey.200',
                color: msg.sender_id === user?.user_id ? 'white' : 'black',
                borderRadius: 1
              }}
            >
              <Typography variant="body2">{msg.content}</Typography>
              <Typography variant="caption" display="block" sx={{ opacity: 0.7 }}>
                {new Date(msg.created_at).toLocaleTimeString()}
              </Typography>
            </Paper>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>
      <Box sx={{ p: 1, borderTop: 1, borderColor: 'divider', display: 'flex' }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Повідомлення..."
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          onKeyDown={handleKeyPress}
          multiline
          maxRows={3}
        />
        <Button variant="contained" sx={{ ml: 1 }} onClick={handleSend} disabled={!newMsg.trim()}>
          Надіслати
        </Button>
      </Box>
    </Paper>
  );
};

export default ChatWidget;