import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import authRouter from './modules/auth/auth.router';
import projectRouter from './modules/project/project.router';

const app = express();

app.use(express.json());
app.use(cookieParser());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRouter);
app.use('/api/projects', projectRouter);

export default app;
