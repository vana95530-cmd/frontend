import { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Button, IconButton, CircularProgress
} from '@mui/material';
import { ThumbUp, ThumbUpOutlined, Close as CloseIcon } from '@mui/icons-material';
import { commentService } from '../../services/adService';
import { useAuth } from '../../context/AuthContext';
import type { Comment } from '../../types';

interface Props {
  adId: number;
}

const CommentsSection: React.FC<Props> = ({ adId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newContent, setNewContent] = useState('');

  const fetchComments = async () => {
    setLoading(true);
    try {
      const data = await commentService.getComments(adId);
      setComments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [adId]);

  const handleCreate = async () => {
    if (!newContent.trim()) return;
    try {
      await commentService.createComment(adId, newContent);
      setNewContent('');
      fetchComments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (commentId: number) => {
    try {
      await commentService.deleteComment(commentId);
      setComments(prev => prev.filter(c => c.comment_id !== commentId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleClose = async (commentId: number) => {
    try {
      await commentService.closeComment(commentId);
      setComments(prev => prev.map(c => c.comment_id === commentId ? { ...c, is_closed: true } : c));
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleLike = async (commentId: number) => {
    try {
      await commentService.toggleLike(commentId);
      fetchComments(); // оновити лічильник
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>Коментарі</Typography>
      {user ? (
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <TextField
            size="small"
            fullWidth
            placeholder="Ваш коментар..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
          />
          <Button variant="contained" onClick={handleCreate}>Додати</Button>
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Увійдіть, щоб залишити коментар.
        </Typography>
      )}
      
      {comments.map(comment => (
        <Box key={comment.comment_id} sx={{ mb: 2, pl: 2, borderLeft: '3px solid #eee' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2">{comment.author_name}</Typography>
            <Box>
              <IconButton size="small" onClick={() => handleToggleLike(comment.comment_id)}>
                {comment.likes_count > 0 ? <ThumbUp fontSize="small" /> : <ThumbUpOutlined fontSize="small" />}
              </IconButton>
              <Typography variant="caption" component="span">{comment.likes_count || ''}</Typography>
              {(user?.user_id === comment.user_id || user?.role === 'admin') && !comment.is_closed && (
                <IconButton size="small" onClick={() => handleClose(comment.comment_id)} title="Закрити">
                  <CloseIcon fontSize="small" />
                </IconButton>
              )}
              {(user?.user_id === comment.user_id || user?.role === 'admin') && (
                <IconButton size="small" onClick={() => handleDelete(comment.comment_id)} title="Видалити">
                  <CloseIcon fontSize="small" color="error" />
                </IconButton>
              )}
            </Box>
          </Box>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{comment.content}</Typography>
          <Typography variant="caption" color="text.secondary">
            {new Date(comment.created_at).toLocaleString()}
            {comment.is_closed && ' (закрито)'}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default CommentsSection;