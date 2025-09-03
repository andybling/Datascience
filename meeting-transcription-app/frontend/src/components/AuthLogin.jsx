import React, { useState } from 'react';
import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import { login, register } from '../services/authService';

export default function AuthLogin({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    try {
      setLoading(true);
      setError('');
      const { token } = await login(email, password);
      if (token && onLogin) onLogin(token);
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister() {
    try {
      setLoading(true);
      setError('');
      await register(email, password);
      await handleLogin();
    } catch (e) {
      setError(e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box>
      <Typography variant="h6" mb={2}>Se connecter</Typography>
      <Stack spacing={2}>
        <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />
        <TextField label="Mot de passe" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth />
        {error && <Typography color="error">{error}</Typography>}
        <Stack direction="row" spacing={2}>
          <Button variant="contained" onClick={handleLogin} disabled={loading}>Connexion</Button>
          <Button variant="outlined" onClick={handleRegister} disabled={loading}>Créer un compte</Button>
        </Stack>
      </Stack>
    </Box>
  );
}

