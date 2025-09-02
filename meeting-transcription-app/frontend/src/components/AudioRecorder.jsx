import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, LinearProgress, Stack, Typography } from '@mui/material';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

export default function AudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [chunks, setChunks] = useState([]);
  const [transcript, setTranscript] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const audioRef = useRef(null);

  useEffect(() => {
    return () => {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }
    };
  }, [mediaRecorder]);

  async function startRecording() {
    setError('');
    setTranscript('');
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    const localChunks = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) localChunks.push(e.data);
    };
    recorder.onstop = () => {
      setChunks(localChunks);
      const blob = new Blob(localChunks, { type: 'audio/webm' });
      if (audioRef.current) {
        audioRef.current.src = URL.createObjectURL(blob);
      }
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

  async function uploadAndTranscribe() {
    try {
      setError('');
      setTranscript('');
      setIsUploading(true);
      setProgress(0);
      const blob = new Blob(chunks, { type: 'audio/webm' });
      const file = new File([blob], `recording-${Date.now()}.webm`, { type: 'audio/webm' });
      const form = new FormData();
      form.append('audio', file);
      const response = await axios.post(`${API_URL}/api/transcribe`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (evt) => {
          if (evt.total) setProgress(Math.round((evt.loaded * 100) / evt.total));
        },
        timeout: 600000,
      });
      setTranscript(response.data.text || '');
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
      <Stack direction="row" spacing={2}>
        {!isRecording ? (
          <Button variant="contained" onClick={startRecording}>Start Recording</Button>
        ) : (
          <Button color="warning" variant="contained" onClick={stopRecording}>Stop</Button>
        )}
        <Button variant="outlined" component="label">
          Choose Audio File
          <input type="file" hidden accept="audio/*,video/*" onChange={onPickFile} />
        </Button>
        <Button variant="contained" disabled={!chunks.length || isUploading} onClick={uploadAndTranscribe}>
          Transcribe
        </Button>
      </Stack>

      {isUploading && (
        <Box>
          <LinearProgress variant="determinate" value={progress} />
          <Typography variant="caption">Uploading... {progress}%</Typography>
        </Box>
      )}

      <audio ref={audioRef} controls />

      {error && <Typography color="error">{error}</Typography>}
      {transcript && (
        <Box>
          <Typography variant="h6">Transcript</Typography>
          <Typography whiteSpace="pre-wrap">{transcript}</Typography>
        </Box>
      )}
    </Stack>
  );
}

