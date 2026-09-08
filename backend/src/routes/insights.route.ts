import { Router } from 'express';
import {
  getAggregates,
  getCompatibleFilters,
  getFilters,
  getInsights,
} from '../controllers/index.js';

export const insightsRouter = Router();

insightsRouter.get('/insights', getInsights);
insightsRouter.get('/filters/compatible', getCompatibleFilters);
insightsRouter.get('/filters', getFilters);
insightsRouter.get('/aggregates', getAggregates);
