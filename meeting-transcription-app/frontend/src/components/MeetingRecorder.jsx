import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, LinearProgress, Stack, TextField, Typography } from '@mui/material';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

export default function MeetingRecorder() {
  const [title, setTitle] = useState('Nouvelle réunion');
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [chunks, setChunks] = useState([]);
  const [result, setResult] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const audioRef = useRef(null);

  useEffect(() => () => { if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop(); }, [mediaRecorder]);

  async function startRecording() {
    setError('');
    setResult(null);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    const localChunks = [];
    recorder.ondataavailable = (e) => { if (e.data.size > 0) localChunks.push(e.data); };
    recorder.onstop = () => {
      setChunks(localChunks);
      const blob = new Blob(localChunks, { type: 'audio/webm' });
      if (audioRef.current) audioRef.current.src = URL.createObjectURL(blob);
    };
    recorder.start();
    setMediaRecorder(recorder);
    setIsRecording(true);
  }

  function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  }

  async function uploadMeeting() {
    try {
      setError('');
      setResult(null);
      setIsUploading(true);
      setProgress(0);
      const blob = new Blob(chunks, { type: 'audio/webm' });
      const file = new File([blob], `meeting-${Date.now()}.webm`, { type: 'audio/webm' });
      const form = new FormData();
      form.append('audio', file);
      form.append('title', title);
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/api/meetings`, form, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
        onUploadProgress: (evt) => { if (evt.total) setProgress(Math.round((evt.loaded * 100) / evt.total)); },
        timeout: 600000,
      });
      setResult(response.data);
    } catch (e) {
      setError(e?.response?.data?.error || e.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  }

  function onPickFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setChunks([file]);
    if (audioRef.current) audioRef.current.src = URL.createObjectURL(file);
  }

  return (
    <Stack spacing={2}>
      <TextField label="Titre de la réunion" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth />
      <Stack direction="row" spacing={2}>
        {!isRecording ? (
          <Button variant="contained" onClick={startRecording}>Démarrer</Button>
        ) : (
          <Button color="warning" variant="contained" onClick={stopRecording}>Arrêter</Button>
        )}
        <Button variant="outlined" component="label">
          Choisir un fichier audio
          <input type="file" hidden accept="audio/*,video/*" onChange={onPickFile} />
        </Button>
        <Button variant="contained" disabled={!chunks.length || isUploading} onClick={uploadMeeting}>
          Créer la réunion
        </Button>
      </Stack>

      {isUploading && (
        <Box>
          <LinearProgress variant="determinate" value={progress} />
          <Typography variant="caption">Téléversement... {progress}%</Typography>
        </Box>
      )}

      <audio ref={audioRef} controls />

      {error && <Typography color="error">{error}</Typography>}
      {result && (
        <Box>
          <Typography variant="h6">Réunion créée</Typography>
          <Typography>ID: {result.meeting?.id} — {result.meeting?.title}</Typography>
          <Typography whiteSpace="pre-wrap">{result.transcription?.text?.slice(0, 300)}</Typography>
        </Box>
      )}
    </Stack>
  );
}

