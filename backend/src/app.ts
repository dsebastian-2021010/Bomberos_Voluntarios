import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/environment';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import { apiLimiter } from './middlewares/rateLimiter';

import authRoutes from './routes/auth';
import usuariosRoutes from './routes/usuarios';
import bloqueosRoutes from './routes/bloqueos';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 600,
  })
);
app.use(express.json());
app.use(apiLimiter);

app.get('/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/bloqueos', bloqueosRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`[Servidor] Bomberos Voluntarios API corriendo en puerto ${config.port} (${config.nodeEnv})`);
});

export default app;
