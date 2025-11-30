import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import 'dotenv/config';
import health from './routes/health.js';

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

app.use('/', health);

export default app;
