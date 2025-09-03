import React, { useEffect, useState } from 'react';
import { Box, Button, List, ListItem, ListItemText, Stack, Typography } from '@mui/material';
import api from '../services/api';

export default function Meetings() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function fetchMeetings() {
    try {
      setLoading(true);
      setError('');
      const { data } = await api.get('/api/meetings');
      setItems(data || []);
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchMeetings(); }, []);

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="h6">Vos réunions</Typography>
        <Button onClick={fetchMeetings} disabled={loading}>Rafraîchir</Button>
      </Stack>
      {error && <Typography color="error">{error}</Typography>}
      <List>
        {items.map((m) => (
          <ListItem key={m.id} divider>
            <ListItemText primary={m.title} secondary={(m.Transcription?.text || '').slice(0, 120)} />
          </ListItem>
        ))}
        {!items.length && <Typography color="text.secondary">Aucune réunion pour le moment.</Typography>}
      </List>
    </Box>
  );
}

