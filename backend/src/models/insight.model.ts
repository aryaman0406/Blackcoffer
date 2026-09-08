import mongoose, { type Document, Schema } from 'mongoose';

export interface IInsight extends Document {
  end_year: number | null;
  intensity: number;
  sector: string;
  topic: string;
  insight: string;
  url: string;
  region: string;
  start_year: number | null;
  impact: number | null;
  added: Date;
  published: Date | null;
  country: string;
  relevance: number;
  pestle: string;
  source: string;
  title: string;
  likelihood: number;
}

const insightSchema = new Schema<IInsight>(
  {
    end_year: {
      type: Number,
      default: null,
    },
    intensity: {
      type: Number,
      required: [true, 'Intensity is required'],
      min: [0, 'Intensity must be greater than or equal to 0'],
      max: [100, 'Intensity must be less than or equal to 100'],
      default: 0,
    },
    sector: {
      type: String,
      default: 'Unspecified',
      trim: true,
    },
    topic: {
      type: String,
      default: 'Unspecified',
      trim: true,
    },
    insight: {
      type: String,
      default: '',
      trim: true,
    },
    url: {
      type: String,
      default: '',
      trim: true,
    },
    region: {
      type: String,
      default: 'Unspecified',
      trim: true,
    },
    start_year: {
      type: Number,
      default: null,
    },
    impact: {
      type: Number,
      default: null,
    },
    added: {
      type: Date,
      required: [true, 'Added date is required'],
      default: Date.now,
    },
    published: {
      type: Date,
      default: null,
    },
    country: {
      type: String,
      default: 'Unspecified',
      trim: true,
    },
    relevance: {
      type: Number,
      required: [true, 'Relevance is required'],
      min: [1, 'Relevance must be greater than or equal to 1'],
      max: [10, 'Relevance must be less than or equal to 10'],
      default: 1,
    },
    pestle: {
      type: String,
      default: 'Unspecified',
      trim: true,
    },
    source: {
      type: String,
      default: 'Unspecified',
      trim: true,
    },
    title: {
      type: String,
      default: '',
      trim: true,
    },
    likelihood: {
      type: Number,
      required: [true, 'Likelihood is required'],
      min: [1, 'Likelihood must be greater than or equal to 1'],
      max: [10, 'Likelihood must be less than or equal to 10'],
      default: 1,
    },
  },
  {
    collection: 'insights',
    timestamps: true,
  },
);

// Indexes on: topic, sector, region, pestle, source, country, published
insightSchema.index({ topic: 1 });
insightSchema.index({ sector: 1 });
insightSchema.index({ region: 1 });
insightSchema.index({ pestle: 1 });
insightSchema.index({ source: 1 });
insightSchema.index({ country: 1 });
insightSchema.index({ published: 1 });

export const Insight = mongoose.model<IInsight>('Insight', insightSchema, 'insights');
