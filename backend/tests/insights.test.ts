import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { Insight } from '../src/models/index.js';

const sampleInsights = [
  {
    title: 'Oil Market Dynamics in North America',
    insight: 'Shale production continues to increase in North America.',
    topic: 'oil',
    sector: 'Energy',
    region: 'Northern America',
    pestle: 'Economic',
    source: 'EIA',
    country: 'United States of America',
    intensity: 12,
    likelihood: 3,
    relevance: 4,
    start_year: 2017,
    end_year: 2020,
    impact: null,
    added: new Date('2017-01-20T03:51:25.000Z'),
    published: new Date('2017-01-15T00:00:00.000Z'),
    url: 'https://example.com/oil-na',
  },
  {
    title: 'Natural Gas Infrastructure Expansion',
    insight: 'Investments in LNG export facilities accelerate.',
    topic: 'gas',
    sector: 'Energy',
    region: 'Northern America',
    pestle: 'Industries',
    source: 'DOE',
    country: 'United States of America',
    intensity: 16,
    likelihood: 4,
    relevance: 4,
    start_year: 2018,
    end_year: 2025,
    impact: null,
    added: new Date('2017-01-20T03:51:25.000Z'),
    published: new Date('2018-03-10T00:00:00.000Z'),
    url: 'https://example.com/gas-na',
  },
  {
    title: 'Renewable Power Shift in Western Europe',
    insight: 'Offshore wind capacity reaches record generation levels.',
    topic: 'renewables',
    sector: 'Energy',
    region: 'Western Europe',
    pestle: 'Environmental',
    source: 'Reuters',
    country: 'Germany',
    intensity: 20,
    likelihood: 4,
    relevance: 5,
    start_year: null,
    end_year: 2030,
    impact: null,
    added: new Date('2017-02-14T00:00:00.000Z'),
    published: new Date('2016-11-05T00:00:00.000Z'),
    url: 'https://example.com/renewables-eu',
  },
  {
    title: 'Retail E-commerce Growth in Asia',
    insight: 'Online retail sales surge across emerging markets.',
    topic: 'consumption',
    sector: 'Retail',
    region: 'Eastern Asia',
    pestle: 'Economic',
    source: 'Bloomberg',
    country: 'China',
    intensity: 8,
    likelihood: 2,
    relevance: 3,
    start_year: 2016,
    end_year: 2022,
    impact: null,
    added: new Date('2017-01-18T00:00:00.000Z'),
    published: new Date('2016-08-20T00:00:00.000Z'),
    url: 'https://example.com/retail-asia',
  },
  {
    title: 'Automotive Electric Vehicle Production Boom',
    insight: 'Automakers transition supply chains to battery pack manufacturing.',
    topic: 'automotive',
    sector: 'Manufacturing',
    region: 'Western Europe',
    pestle: 'Technological',
    source: 'Bloomberg',
    country: 'Germany',
    intensity: 24,
    likelihood: 4,
    relevance: 4,
    start_year: 2019,
    end_year: 2028,
    impact: null,
    added: new Date('2017-03-01T00:00:00.000Z'),
    published: new Date('2017-06-12T00:00:00.000Z'),
    url: 'https://example.com/ev-auto',
  },
];

describe('Insights API Integration Tests', () => {
  const app = createApp();

  beforeEach(async () => {
    await Insight.deleteMany({});
    await Insight.insertMany(sampleInsights);
  });

  // ==========================================
  // 1. GET /api/insights
  // ==========================================
  describe('GET /api/insights', () => {
    it('returns all insights paginated when no filters are provided', async () => {
      const response = await request(app).get('/api/insights');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total', 5);
      expect(response.body).toHaveProperty('page', 1);
      expect(response.body).toHaveProperty('totalPages', 1);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data).toHaveLength(5);

      const firstItem = response.body.data[0];
      expect(firstItem).toHaveProperty('title');
      expect(firstItem).toHaveProperty('intensity');
      expect(firstItem).toHaveProperty('likelihood');
      expect(firstItem).toHaveProperty('relevance');
      expect(firstItem).toHaveProperty('sector');
      expect(firstItem).toHaveProperty('topic');
    });

    it('filters correctly by single categorical filter (sector=Energy)', async () => {
      const response = await request(app).get('/api/insights?sector=Energy');

      expect(response.status).toBe(200);
      expect(response.body.total).toBe(3);
      expect(response.body.data).toHaveLength(3);
      expect(response.body.data.every((item: { sector: string }) => item.sector === 'Energy')).toBe(
        true,
      );
    });

    it('filters correctly with multiple combined filters (sector=Energy, country=United States of America, minIntensity=15)', async () => {
      const response = await request(app).get(
        '/api/insights?sector=Energy&country=United States of America&minIntensity=15',
      );

      expect(response.status).toBe(200);
      expect(response.body.total).toBe(1);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].title).toBe('Natural Gas Infrastructure Expansion');
      expect(response.body.data[0].intensity).toBe(16);
      expect(response.body.data[0].sector).toBe('Energy');
      expect(response.body.data[0].country).toBe('United States of America');
    });

    it('filters correctly by published year range (minYear=2017, maxYear=2018)', async () => {
      const response = await request(app).get('/api/insights?minYear=2017&maxYear=2018');

      expect(response.status).toBe(200);
      expect(response.body.total).toBe(3);
      expect(response.body.data).toHaveLength(3);

      const publishedYears = response.body.data.map((item: { published: string }) =>
        new Date(item.published).getUTCFullYear(),
      );
      expect(publishedYears.every((year: number) => year >= 2017 && year <= 2018)).toBe(true);
    });

    it('returns 400 when an invalid filter parameter is passed (minIntensity > 100)', async () => {
      const response = await request(app).get('/api/insights?minIntensity=150');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('minIntensity cannot be greater than 100');
    });

    it('returns 400 when minYear is greater than maxYear', async () => {
      const response = await request(app).get('/api/insights?minYear=2025&maxYear=2015');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('minYear cannot be greater than maxYear');
    });

    it('returns empty array and zero total when filters match no records', async () => {
      const response = await request(app).get('/api/insights?country=NonExistentCountry');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        data: [],
        total: 0,
        page: 1,
        totalPages: 0,
      });
    });

    it('supports custom pagination limit and page', async () => {
      const response = await request(app).get('/api/insights?page=1&limit=2');

      expect(response.status).toBe(200);
      expect(response.body.total).toBe(5);
      expect(response.body.page).toBe(1);
      expect(response.body.totalPages).toBe(3);
      expect(response.body.data).toHaveLength(2);
    });
  });

  // ==========================================
  // 2. GET /api/filters
  // ==========================================
  describe('GET /api/filters', () => {
    it('returns distinct, sorted filter options with exact record counts', async () => {
      const response = await request(app).get('/api/filters');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('topic');
      expect(response.body).toHaveProperty('sector');
      expect(response.body).toHaveProperty('region');
      expect(response.body).toHaveProperty('pestle');
      expect(response.body).toHaveProperty('source');
      expect(response.body).toHaveProperty('country');

      // Assert exact sector counts and alphabetical sort
      expect(response.body.sector).toEqual([
        { value: 'Energy', count: 3 },
        { value: 'Manufacturing', count: 1 },
        { value: 'Retail', count: 1 },
      ]);

      // Assert region counts and alphabetical sort
      expect(response.body.region).toEqual([
        { value: 'Eastern Asia', count: 1 },
        { value: 'Northern America', count: 2 },
        { value: 'Western Europe', count: 2 },
      ]);

      // Assert country counts and alphabetical sort
      expect(response.body.country).toEqual([
        { value: 'China', count: 1 },
        { value: 'Germany', count: 2 },
        { value: 'United States of America', count: 2 },
      ]);

      // Assert sources counts
      expect(response.body.source).toEqual([
        { value: 'Bloomberg', count: 2 },
        { value: 'DOE', count: 1 },
        { value: 'EIA', count: 1 },
        { value: 'Reuters', count: 1 },
      ]);
    });
  });

  // ==========================================
  // 3. GET /api/aggregates
  // ==========================================
  describe('GET /api/aggregates', () => {
    it('returns pre-aggregated chart metrics for all records when no filters are active', async () => {
      const response = await request(app).get('/api/aggregates');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('byYear');
      expect(response.body).toHaveProperty('byRegion');
      expect(response.body).toHaveProperty('bySector');
      expect(response.body).toHaveProperty('byTopic');
      expect(response.body).toHaveProperty('byPestle');
      expect(response.body).toHaveProperty('summary');

      // Summary assertions
      expect(response.body.summary.totalRecords).toBe(5);
      // Total intensity sum: 12 + 16 + 20 + 8 + 24 = 80 / 5 = 16.00
      expect(response.body.summary.avgIntensity).toBe(16);
      // Total likelihood sum: 3 + 4 + 4 + 2 + 4 = 17 / 5 = 3.4
      expect(response.body.summary.avgLikelihood).toBe(3.4);
      // Total relevance sum: 4 + 4 + 5 + 3 + 4 = 20 / 5 = 4.0
      expect(response.body.summary.avgRelevance).toBe(4);

      // bySector breakdown
      const energySector = response.body.bySector.find(
        (s: { sector: string }) => s.sector === 'Energy',
      );
      expect(energySector).toBeDefined();
      expect(energySector.count).toBe(3);
      // Energy intensity: (12 + 16 + 20) / 3 = 16.00
      expect(energySector.avgIntensity).toBe(16);

      // byYear breakdown
      expect(response.body.byYear).toHaveLength(3);
      const year2017 = response.body.byYear.find((y: { year: number }) => y.year === 2017);
      expect(year2017).toBeDefined();
      expect(year2017.count).toBe(2); // 2 records published in 2017
    });

    it('respects query filters and dynamically computes aggregate metrics (region=Western Europe)', async () => {
      const response = await request(app).get('/api/aggregates?region=Western Europe');

      expect(response.status).toBe(200);
      expect(response.body.summary.totalRecords).toBe(2);
      expect(response.body.byRegion).toHaveLength(1);
      expect(response.body.byRegion[0].region).toBe('Western Europe');
      expect(response.body.byRegion[0].count).toBe(2);
      // Intensities in Western Europe: 20 + 24 = 44 / 2 = 22.00
      expect(response.body.byRegion[0].avgIntensity).toBe(22);
    });

    it('returns 400 when invalid query parameters are supplied to /api/aggregates', async () => {
      const response = await request(app).get('/api/aggregates?minLikelihood=99');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('minLikelihood cannot be greater than 10');
    });

    it('returns zero summary when filter matches zero records', async () => {
      const response = await request(app).get('/api/aggregates?country=Atlantis');

      expect(response.status).toBe(200);
      expect(response.body.summary).toEqual({
        totalRecords: 0,
        avgIntensity: 0,
        avgLikelihood: 0,
        avgRelevance: 0,
      });
      expect(response.body.byYear).toEqual([]);
      expect(response.body.byRegion).toEqual([]);
      expect(response.body.bySector).toEqual([]);
      expect(response.body.byTopic).toEqual([]);
      expect(response.body.byPestle).toEqual([]);
    });
  });
});
