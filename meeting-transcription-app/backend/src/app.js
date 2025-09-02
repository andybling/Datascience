import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import { createRequire } from 'module';
import routes from './routes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/uploads', express.static(path.resolve('uploads')));

// Swagger basic setup (placeholder)
const require = createRequire(import.meta.url);
const swaggerDocument = {
  openapi: '3.0.0',
  info: { title: 'Meeting Transcription API', version: '0.1.0' },
};
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api', routes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const port = process.env.PORT || 4000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend listening on port ${port}`);
  });
}

export default app;

