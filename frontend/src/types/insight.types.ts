export interface InsightItem {
  _id: string;
  end_year: number | null;
  intensity: number;
  sector: string;
  topic: string;
  insight: string;
  url: string;
  region: string;
  start_year: number | null;
  impact: number | null;
  added: string;
  published: string | null;
  country: string;
  relevance: number;
  pestle: string;
  source: string;
  title: string;
  likelihood: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface FilterParams {
  topic?: string;
  sector?: string;
  region?: string;
  pestle?: string;
  source?: string;
  country?: string;
  minYear?: number;
  maxYear?: number;
  minIntensity?: number;
  maxIntensity?: number;
  minLikelihood?: number;
  minRelevance?: number;
  page?: number;
  limit?: number;
}

export interface PaginatedInsightsResponse {
  data: InsightItem[];
  total: number;
  page: number;
  totalPages: number;
}

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

export interface SummaryAggregate {
  totalRecords: number;
  avgIntensity: number;
  avgLikelihood: number;
  avgRelevance: number;
}

export interface AggregatesResponse {
  byYear: YearAggregate[];
  byRegion: RegionAggregate[];
  bySector: SectorAggregate[];
  byTopic: TopicAggregate[];
  byPestle: PestleAggregate[];
  byCountry: CountryAggregate[];
  regionYearHeatmap: RegionYearHeatmapItem[];
  summary: SummaryAggregate;
}

export type ApiResult<T> = { data: T; error?: never } | { data?: never; error: string };
