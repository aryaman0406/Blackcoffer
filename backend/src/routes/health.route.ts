import { Router } from 'express';
import { getHealth } from '../controllers/index.js';

export const healthRouter = Router();

healthRouter.get('/health', getHealth);
