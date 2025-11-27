// src/app.ts
import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';
import orderRoutes from './routes/order.routes';
import clickstreamRoutes from './routes/clickstream.routes';
import productRoutes from './routes/product.routes';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api', orderRoutes);
app.use('/api', clickstreamRoutes); 

app.use('/api/products', productRoutes);

app.use(errorHandler);

export default app;
