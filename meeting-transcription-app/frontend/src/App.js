import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import './App.css';
import AudioRecorder from './components/AudioRecorder';

function App() {
  return (
    <Container maxWidth="md" sx={{ paddingTop: 48, paddingBottom: 48 }}>
      <Box textAlign="center" marginBottom={4}>
        <Typography variant="h4" fontWeight={700}>Meeting Transcription MVP</Typography>
        <Typography variant="body1" color="text.secondary">Record or upload audio and transcribe with Whisper</Typography>
      </Box>
      <AudioRecorder />
    </Container>
  );
}

export default App;
