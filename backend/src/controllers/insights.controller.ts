import type { NextFunction, Request, Response } from 'express';
import { QueryService } from '../services/index.js';
import { compatibleFilterSchema, queryFilterSchema } from '../validators/index.js';

export const getInsights = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const validatedQuery = queryFilterSchema.parse(req.query);
    const result = await QueryService.getInsights(validatedQuery);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getFilters = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await QueryService.getFilters();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getCompatibleFilters = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const validatedQuery = compatibleFilterSchema.parse(req.query);
    const result = await QueryService.getCompatibleFilters(validatedQuery);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getAggregates = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const validatedQuery = queryFilterSchema.parse(req.query);
    const result = await QueryService.getAggregates(validatedQuery);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
