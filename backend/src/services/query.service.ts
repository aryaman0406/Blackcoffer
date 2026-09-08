import type { RootFilterQuery } from 'mongoose';
import { type IInsight, Insight } from '../models/index.js';
import type { CompatibleFilterParams, QueryFilterParams } from '../validators/index.js';

export interface FilterOptionItem {
  value: string;
  count: number;
}

export interface FilterOptionsResponse {
  topic: FilterOptionItem[];
  sector: FilterOptionItem[];
  region: FilterOptionItem[];
  pestle: FilterOptionItem[];
  source: FilterOptionItem[];
  country: FilterOptionItem[];
}

export interface AggregatedMetric {
  avgIntensity: number;
  avgLikelihood: number;
  avgRelevance: number;
  count: number;
}

export interface YearAggregate extends AggregatedMetric {
  year: number;
}

export interface RegionAggregate extends AggregatedMetric {
  region: string;
}

export interface SectorAggregate extends AggregatedMetric {
  sector: string;
}

export interface TopicAggregate extends AggregatedMetric {
  topic: string;
}

export interface PestleAggregate extends AggregatedMetric {
  pestle: string;
}

export interface CountryAggregate extends AggregatedMetric {
  country: string;
}

export interface RegionYearHeatmapItem {
  region: string;
  year: number;
  avgIntensity: number;
  count: number;
}

export interface AggregatesResponse {
  byYear: YearAggregate[];
  byRegion: RegionAggregate[];
  bySector: SectorAggregate[];
  byTopic: TopicAggregate[];
  byPestle: PestleAggregate[];
  byCountry: CountryAggregate[];
  regionYearHeatmap: RegionYearHeatmapItem[];
  summary: {
    totalRecords: number;
    avgIntensity: number;
    avgLikelihood: number;
    avgRelevance: number;
  };
}

export interface PaginatedInsightsResponse {
  data: IInsight[];
  total: number;
  page: number;
  totalPages: number;
}

export class QueryService {
  public static buildFilterQuery(params: QueryFilterParams): RootFilterQuery<IInsight> {
    const query: RootFilterQuery<IInsight> = {};

    if (params.topic) {
      if (params.topic.includes(',')) {
        const topics = params.topic
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean);
        query.topic = { $in: topics };
      } else {
        query.topic = params.topic;
      }
    }
    if (params.sector) {
      query.sector = params.sector;
    }
    if (params.region) {
      query.region = params.region;
    }
    if (params.pestle) {
      query.pestle = params.pestle;
    }
    if (params.source) {
      query.source = params.source;
    }
    if (params.country) {
      query.country = params.country;
    }

    // Published Year Filter
    if (params.minYear !== undefined || params.maxYear !== undefined) {
      const publishedFilter: { $gte?: Date; $lte?: Date } = {};
      if (params.minYear !== undefined) {
        publishedFilter.$gte = new Date(Date.UTC(params.minYear, 0, 1, 0, 0, 0, 0));
      }
      if (params.maxYear !== undefined) {
        publishedFilter.$lte = new Date(Date.UTC(params.maxYear, 11, 31, 23, 59, 59, 999));
      }
      query.published = publishedFilter;
    }

    // Intensity Filter
    if (params.minIntensity !== undefined || params.maxIntensity !== undefined) {
      const intensityFilter: { $gte?: number; $lte?: number } = {};
      if (params.minIntensity !== undefined) {
        intensityFilter.$gte = params.minIntensity;
      }
      if (params.maxIntensity !== undefined) {
        intensityFilter.$lte = params.maxIntensity;
      }
      query.intensity = intensityFilter;
    }

    // Likelihood Filter
    if (params.minLikelihood !== undefined) {
      query.likelihood = { $gte: params.minLikelihood };
    }

    // Relevance Filter
    if (params.minRelevance !== undefined) {
      query.relevance = { $gte: params.minRelevance };
    }

    return query;
  }

  public static async getInsights(params: QueryFilterParams): Promise<PaginatedInsightsResponse> {
    const query = this.buildFilterQuery(params);
    const page = params.page;
    const limit = params.limit;
    const skip = (page - 1) * limit;

    const [total, data] = await Promise.all([
      Insight.countDocuments(query),
      Insight.find(query)
        .sort({ published: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean<IInsight[]>(),
    ]);

    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      totalPages,
    };
  }

  public static async getFilters(): Promise<FilterOptionsResponse> {
    const [result] = await Insight.aggregate<FilterOptionsResponse>([
      {
        $facet: {
          topic: [
            { $match: { topic: { $ne: null } } },
            { $group: { _id: '$topic', count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
            { $project: { _id: 0, value: '$_id', count: 1 } },
          ],
          sector: [
            { $match: { sector: { $ne: null } } },
            { $group: { _id: '$sector', count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
            { $project: { _id: 0, value: '$_id', count: 1 } },
          ],
          region: [
            { $match: { region: { $ne: null } } },
            { $group: { _id: '$region', count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
            { $project: { _id: 0, value: '$_id', count: 1 } },
          ],
          pestle: [
            { $match: { pestle: { $ne: null } } },
            { $group: { _id: '$pestle', count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
            { $project: { _id: 0, value: '$_id', count: 1 } },
          ],
          source: [
            { $match: { source: { $ne: null } } },
            { $group: { _id: '$source', count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
            { $project: { _id: 0, value: '$_id', count: 1 } },
          ],
          country: [
            { $match: { country: { $ne: null } } },
            { $group: { _id: '$country', count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
            { $project: { _id: 0, value: '$_id', count: 1 } },
          ],
        },
      },
    ]);

    return {
      topic: result?.topic ?? [],
      sector: result?.sector ?? [],
      region: result?.region ?? [],
      pestle: result?.pestle ?? [],
      source: result?.source ?? [],
      country: result?.country ?? [],
    };
  }

  public static async getCompatibleFilters(
    params: CompatibleFilterParams,
  ): Promise<FilterOptionsResponse> {
    const matchQuery: RootFilterQuery<IInsight> = {};

    if (params.country) {
      matchQuery.country = params.country;
    }
    if (params.region) {
      matchQuery.region = params.region;
    }
    if (params.sector) {
      matchQuery.sector = params.sector;
    }
    if (params.topic) {
      matchQuery.topic = params.topic;
    }
    if (params.pestle) {
      matchQuery.pestle = params.pestle;
    }
    if (params.source) {
      matchQuery.source = params.source;
    }

    const [result] = await Insight.aggregate<FilterOptionsResponse>([
      { $match: matchQuery },
      {
        $facet: {
          topic: [
            { $match: { topic: { $ne: null } } },
            { $group: { _id: '$topic', count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
            { $project: { _id: 0, value: '$_id', count: 1 } },
          ],
          sector: [
            { $match: { sector: { $ne: null } } },
            { $group: { _id: '$sector', count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
            { $project: { _id: 0, value: '$_id', count: 1 } },
          ],
          region: [
            { $match: { region: { $ne: null } } },
            { $group: { _id: '$region', count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
            { $project: { _id: 0, value: '$_id', count: 1 } },
          ],
          pestle: [
            { $match: { pestle: { $ne: null } } },
            { $group: { _id: '$pestle', count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
            { $project: { _id: 0, value: '$_id', count: 1 } },
          ],
          source: [
            { $match: { source: { $ne: null } } },
            { $group: { _id: '$source', count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
            { $project: { _id: 0, value: '$_id', count: 1 } },
          ],
          country: [
            { $match: { country: { $ne: null } } },
            { $group: { _id: '$country', count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
            { $project: { _id: 0, value: '$_id', count: 1 } },
          ],
        },
      },
    ]);

    return {
      topic: result?.topic ?? [],
      sector: result?.sector ?? [],
      region: result?.region ?? [],
      pestle: result?.pestle ?? [],
      source: result?.source ?? [],
      country: result?.country ?? [],
    };
  }

  public static async getAggregates(params: QueryFilterParams): Promise<AggregatesResponse> {
    const matchQuery = this.buildFilterQuery(params);

    interface AggregationFacetResult {
      byYear: YearAggregate[];
      byRegion: RegionAggregate[];
      bySector: SectorAggregate[];
      byPestle: PestleAggregate[];
      byCountry: CountryAggregate[];
      regionYearHeatmap: RegionYearHeatmapItem[];
      byTopicRaw: Array<{
        _id: string;
        avgIntensity: number;
        avgLikelihood: number;
        avgRelevance: number;
        totalIntensity: number;
        totalLikelihood: number;
        totalRelevance: number;
        count: number;
      }>;
      summary: Array<{
        totalRecords: number;
        avgIntensity: number;
        avgLikelihood: number;
        avgRelevance: number;
      }>;
    }

    const [aggregateResult] = await Insight.aggregate<AggregationFacetResult>([
      { $match: matchQuery },
      {
        $facet: {
          byYear: [
            { $match: { published: { $ne: null } } },
            {
              $group: {
                _id: { $year: '$published' },
                avgIntensity: { $avg: '$intensity' },
                avgLikelihood: { $avg: '$likelihood' },
                avgRelevance: { $avg: '$relevance' },
                count: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
            {
              $project: {
                _id: 0,
                year: '$_id',
                avgIntensity: { $round: ['$avgIntensity', 2] },
                avgLikelihood: { $round: ['$avgLikelihood', 2] },
                avgRelevance: { $round: ['$avgRelevance', 2] },
                count: 1,
              },
            },
          ],
          byRegion: [
            {
              $group: {
                _id: '$region',
                avgIntensity: { $avg: '$intensity' },
                avgLikelihood: { $avg: '$likelihood' },
                avgRelevance: { $avg: '$relevance' },
                count: { $sum: 1 },
              },
            },
            { $sort: { count: -1, _id: 1 } },
            {
              $project: {
                _id: 0,
                region: '$_id',
                avgIntensity: { $round: ['$avgIntensity', 2] },
                avgLikelihood: { $round: ['$avgLikelihood', 2] },
                avgRelevance: { $round: ['$avgRelevance', 2] },
                count: 1,
              },
            },
          ],
          bySector: [
            {
              $group: {
                _id: '$sector',
                avgIntensity: { $avg: '$intensity' },
                avgLikelihood: { $avg: '$likelihood' },
                avgRelevance: { $avg: '$relevance' },
                count: { $sum: 1 },
              },
            },
            { $sort: { count: -1, _id: 1 } },
            {
              $project: {
                _id: 0,
                sector: '$_id',
                avgIntensity: { $round: ['$avgIntensity', 2] },
                avgLikelihood: { $round: ['$avgLikelihood', 2] },
                avgRelevance: { $round: ['$avgRelevance', 2] },
                count: 1,
              },
            },
          ],
          byPestle: [
            {
              $group: {
                _id: '$pestle',
                avgIntensity: { $avg: '$intensity' },
                avgLikelihood: { $avg: '$likelihood' },
                avgRelevance: { $avg: '$relevance' },
                count: { $sum: 1 },
              },
            },
            { $sort: { count: -1, _id: 1 } },
            {
              $project: {
                _id: 0,
                pestle: '$_id',
                avgIntensity: { $round: ['$avgIntensity', 2] },
                avgLikelihood: { $round: ['$avgLikelihood', 2] },
                avgRelevance: { $round: ['$avgRelevance', 2] },
                count: 1,
              },
            },
          ],
          byCountry: [
            { $match: { country: { $nin: [null, ''] } } },
            {
              $group: {
                _id: '$country',
                avgIntensity: { $avg: '$intensity' },
                avgLikelihood: { $avg: '$likelihood' },
                avgRelevance: { $avg: '$relevance' },
                count: { $sum: 1 },
              },
            },
            { $sort: { count: -1, _id: 1 } },
            {
              $project: {
                _id: 0,
                country: '$_id',
                avgIntensity: { $round: ['$avgIntensity', 2] },
                avgLikelihood: { $round: ['$avgLikelihood', 2] },
                avgRelevance: { $round: ['$avgRelevance', 2] },
                count: 1,
              },
            },
          ],
          regionYearHeatmap: [
            { $match: { published: { $ne: null }, region: { $nin: [null, ''] } } },
            {
              $group: {
                _id: {
                  region: '$region',
                  year: { $year: '$published' },
                },
                avgIntensity: { $avg: '$intensity' },
                count: { $sum: 1 },
              },
            },
            { $sort: { '_id.region': 1, '_id.year': 1 } },
            {
              $project: {
                _id: 0,
                region: '$_id.region',
                year: '$_id.year',
                avgIntensity: { $round: ['$avgIntensity', 2] },
                count: 1,
              },
            },
          ],
          byTopicRaw: [
            {
              $group: {
                _id: '$topic',
                avgIntensity: { $avg: '$intensity' },
                avgLikelihood: { $avg: '$likelihood' },
                avgRelevance: { $avg: '$relevance' },
                totalIntensity: { $sum: '$intensity' },
                totalLikelihood: { $sum: '$likelihood' },
                totalRelevance: { $sum: '$relevance' },
                count: { $sum: 1 },
              },
            },
            { $sort: { count: -1, _id: 1 } },
          ],
          summary: [
            {
              $group: {
                _id: null,
                totalRecords: { $sum: 1 },
                avgIntensity: { $avg: '$intensity' },
                avgLikelihood: { $avg: '$likelihood' },
                avgRelevance: { $avg: '$relevance' },
              },
            },
            {
              $project: {
                _id: 0,
                totalRecords: 1,
                avgIntensity: { $round: ['$avgIntensity', 2] },
                avgLikelihood: { $round: ['$avgLikelihood', 2] },
                avgRelevance: { $round: ['$avgRelevance', 2] },
              },
            },
          ],
        },
      },
    ]);

    // Process top 15 topics + Other bucket
    const rawTopics = aggregateResult?.byTopicRaw ?? [];
    let byTopic: TopicAggregate[] = [];

    if (rawTopics.length <= 15) {
      byTopic = rawTopics.map((item) => ({
        topic: item._id,
        avgIntensity: Number(item.avgIntensity.toFixed(2)),
        avgLikelihood: Number(item.avgLikelihood.toFixed(2)),
        avgRelevance: Number(item.avgRelevance.toFixed(2)),
        count: item.count,
      }));
    } else {
      const top15 = rawTopics.slice(0, 15).map((item) => ({
        topic: item._id,
        avgIntensity: Number(item.avgIntensity.toFixed(2)),
        avgLikelihood: Number(item.avgLikelihood.toFixed(2)),
        avgRelevance: Number(item.avgRelevance.toFixed(2)),
        count: item.count,
      }));

      const remaining = rawTopics.slice(15);
      const otherCount = remaining.reduce((acc, curr) => acc + curr.count, 0);
      const otherTotalIntensity = remaining.reduce((acc, curr) => acc + curr.totalIntensity, 0);
      const otherTotalLikelihood = remaining.reduce((acc, curr) => acc + curr.totalLikelihood, 0);
      const otherTotalRelevance = remaining.reduce((acc, curr) => acc + curr.totalRelevance, 0);

      const otherBucket: TopicAggregate = {
        topic: 'Other',
        avgIntensity: otherCount > 0 ? Number((otherTotalIntensity / otherCount).toFixed(2)) : 0,
        avgLikelihood: otherCount > 0 ? Number((otherTotalLikelihood / otherCount).toFixed(2)) : 0,
        avgRelevance: otherCount > 0 ? Number((otherTotalRelevance / otherCount).toFixed(2)) : 0,
        count: otherCount,
      };

      byTopic = [...top15, otherBucket];
    }

    const summary = aggregateResult?.summary?.[0] ?? {
      totalRecords: 0,
      avgIntensity: 0,
      avgLikelihood: 0,
      avgRelevance: 0,
    };

    return {
      byYear: aggregateResult?.byYear ?? [],
      byRegion: aggregateResult?.byRegion ?? [],
      bySector: aggregateResult?.bySector ?? [],
      byTopic,
      byPestle: aggregateResult?.byPestle ?? [],
      byCountry: aggregateResult?.byCountry ?? [],
      regionYearHeatmap: aggregateResult?.regionYearHeatmap ?? [],
      summary,
    };
  }
}
