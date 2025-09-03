import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Meeting, Transcription } from './models.js';
import { transcribeAudio } from './services.js';

const jwtSecret = process.env.JWT_SECRET || 'dev-secret';

export async function register(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });
    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(409).json({ error: 'User already exists' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash });
    return res.json({ id: user.id, email: user.email });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ sub: user.id, email: user.email }, jwtSecret, { expiresIn: '7d' });
    return res.json({ token });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const [, token] = header.split(' ');
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    const payload = jwt.verify(token, jwtSecret);
    req.userId = payload.sub;
    return next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export async function listMeetings(req, res) {
  try {
    const meetings = await Meeting.findAll({ where: { userId: req.userId }, include: [Transcription] });
    return res.json(meetings);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

export async function createMeetingAndTranscribe(req, res) {
  try {
    if (!req.file) return res.status(400).json({ error: 'No audio file uploaded' });
    const title = req.body.title || `Meeting ${new Date().toISOString()}`;
    const meeting = await Meeting.create({ title, userId: req.userId });
    const result = await transcribeAudio(req.file.path);
    const record = await Transcription.create({
      meetingId: meeting.id,
      text: result.text,
      language: result.language,
      duration: result.duration,
    });
    return res.json({ meeting, transcription: record });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

