import { z } from 'zod';

export const queryFilterSchema = z
  .object({
    topic: z.string().trim().min(1, 'Topic filter cannot be empty').optional(),
    sector: z.string().trim().min(1, 'Sector filter cannot be empty').optional(),
    region: z.string().trim().min(1, 'Region filter cannot be empty').optional(),
    pestle: z.string().trim().min(1, 'Pestle filter cannot be empty').optional(),
    source: z.string().trim().min(1, 'Source filter cannot be empty').optional(),
    country: z.string().trim().min(1, 'Country filter cannot be empty').optional(),
    minYear: z.coerce
      .number({ invalid_type_error: 'minYear must be a valid number' })
      .int('minYear must be an integer')
      .min(1000, 'minYear must be at least 1000')
      .max(3000, 'minYear must be at most 3000')
      .optional(),
    maxYear: z.coerce
      .number({ invalid_type_error: 'maxYear must be a valid number' })
      .int('maxYear must be an integer')
      .min(1000, 'maxYear must be at least 1000')
      .max(3000, 'maxYear must be at most 3000')
      .optional(),
    minIntensity: z.coerce
      .number({ invalid_type_error: 'minIntensity must be a valid number' })
      .min(0, 'minIntensity cannot be less than 0')
      .max(100, 'minIntensity cannot be greater than 100')
      .optional(),
    maxIntensity: z.coerce
      .number({ invalid_type_error: 'maxIntensity must be a valid number' })
      .min(0, 'maxIntensity cannot be less than 0')
      .max(100, 'maxIntensity cannot be greater than 100')
      .optional(),
    minLikelihood: z.coerce
      .number({ invalid_type_error: 'minLikelihood must be a valid number' })
      .min(1, 'minLikelihood cannot be less than 1')
      .max(10, 'minLikelihood cannot be greater than 10')
      .optional(),
    minRelevance: z.coerce
      .number({ invalid_type_error: 'minRelevance must be a valid number' })
      .min(1, 'minRelevance cannot be less than 1')
      .max(10, 'minRelevance cannot be greater than 10')
      .optional(),
    page: z.coerce
      .number({ invalid_type_error: 'page must be a number' })
      .int('page must be an integer')
      .min(1, 'page must be at least 1')
      .default(1),
    limit: z.coerce
      .number({ invalid_type_error: 'limit must be a number' })
      .int('limit must be an integer')
      .min(1, 'limit must be at least 1')
      .max(500, 'limit cannot exceed 500')
      .default(100),
  })
  .strict({ message: 'Unrecognized query parameter provided' })
  .refine(
    (data) => {
      if (data.minYear !== undefined && data.maxYear !== undefined) {
        return data.minYear <= data.maxYear;
      }
      return true;
    },
    {
      message: 'minYear cannot be greater than maxYear',
      path: ['minYear'],
    },
  )
  .refine(
    (data) => {
      if (data.minIntensity !== undefined && data.maxIntensity !== undefined) {
        return data.minIntensity <= data.maxIntensity;
      }
      return true;
    },
    {
      message: 'minIntensity cannot be greater than maxIntensity',
      path: ['minIntensity'],
    },
  );

export type QueryFilterParams = z.infer<typeof queryFilterSchema>;
