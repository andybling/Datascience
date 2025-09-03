import React from 'react';
import { Container, Typography, Box, Divider, Stack, Button } from '@mui/material';
import './App.css';
import AudioRecorder from './components/AudioRecorder';
import AuthLogin from './components/AuthLogin';
import Meetings from './components/Meetings';
import MeetingRecorder from './components/MeetingRecorder';
import { logout, getToken } from './services/authService';

function App() {
  const [token, setToken] = React.useState(getToken());

  return (
    <Container maxWidth="md" sx={{ paddingTop: 48, paddingBottom: 48 }}>
      <Box textAlign="center" marginBottom={2}>
        <Typography variant="h4" fontWeight={700}>Meeting Transcription MVP</Typography>
        <Typography variant="body1" color="text.secondary">Record/Upload, Transcribe, Save Meetings</Typography>
      </Box>

      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="subtitle1">{token ? 'Connecté' : 'Non connecté'}</Typography>
        {token && <Button size="small" onClick={() => { logout(); setToken(null); }}>Déconnexion</Button>}
      </Stack>

      {!token ? (
        <AuthLogin onLogin={() => setToken(getToken())} />
      ) : (
        <>
          <Meetings />
          <Divider sx={{ my: 3 }} />
          <MeetingRecorder />
        </>
      )}

      <Divider sx={{ my: 3 }} />
      <Box>
        <Typography variant="h6" gutterBottom>Transcription rapide (sans sauvegarde)</Typography>
        <AudioRecorder />
      </Box>
    </Container>
  );
}

export default App;
