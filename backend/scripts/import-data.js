import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/blackcoffer_dashboard';

const insightSchema = new mongoose.Schema(
  {
    end_year: { type: Number, default: null },
    intensity: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 0,
    },
    sector: { type: String, default: 'Unspecified', trim: true },
    topic: { type: String, default: 'Unspecified', trim: true },
    insight: { type: String, default: '', trim: true },
    url: { type: String, default: '', trim: true },
    region: { type: String, default: 'Unspecified', trim: true },
    start_year: { type: Number, default: null },
    impact: { type: Number, default: null },
    added: { type: Date, required: true, default: Date.now },
    published: { type: Date, default: null },
    country: { type: String, default: 'Unspecified', trim: true },
    relevance: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
      default: 1,
    },
    pestle: { type: String, default: 'Unspecified', trim: true },
    source: { type: String, default: 'Unspecified', trim: true },
    title: { type: String, default: '', trim: true },
    likelihood: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
      default: 1,
    },
  },
  {
    collection: 'insights',
    timestamps: true,
  },
);

insightSchema.index({ topic: 1 });
insightSchema.index({ sector: 1 });
insightSchema.index({ region: 1 });
insightSchema.index({ pestle: 1 });
insightSchema.index({ source: 1 });
insightSchema.index({ country: 1 });
insightSchema.index({ published: 1 });

const Insight = mongoose.model('Insight', insightSchema, 'insights');

const MONTH_NAMES = {
  january: 0,
  february: 1,
  march: 2,
  april: 3,
  may: 4,
  june: 5,
  july: 6,
  august: 7,
  september: 8,
  october: 9,
  november: 10,
  december: 11,
};

function parseCustomDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string' || !dateStr.trim()) {
    return null;
  }

  const trimmed = dateStr.trim();

  // Try standard Date parse first
  const standardDate = new Date(trimmed);
  if (!isNaN(standardDate.getTime())) {
    return standardDate;
  }

  // Format: "Month, DD YYYY HH:MM:SS" or "Month DD YYYY HH:MM:SS"
  const regex = /^([a-zA-Z]+),?\s*(\d{1,2})\s+(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})$/;
  const match = trimmed.match(regex);
  if (match) {
    const [, monthStr, dayStr, yearStr, hourStr, minStr, secStr] = match;
    const month = MONTH_NAMES[monthStr.toLowerCase()];
    if (month !== undefined) {
      const parsed = new Date(
        Date.UTC(
          parseInt(yearStr, 10),
          month,
          parseInt(dayStr, 10),
          parseInt(hourStr, 10),
          parseInt(minStr, 10),
          parseInt(secStr, 10),
        ),
      );
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    }
  }

  return null;
}

function normalizeString(value) {
  if (value === undefined || value === null) {
    return 'Unspecified';
  }
  const str = String(value).trim();
  return str === '' ? 'Unspecified' : str;
}

function normalizeNullableNumber(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const num = Number(value);
  return isNaN(num) ? null : num;
}

function normalizeBoundedNumber(value, min, max, defaultValue) {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }
  const num = Number(value);
  if (isNaN(num)) {
    return defaultValue;
  }
  return Math.min(Math.max(num, min), max);
}

function findDataFile() {
  const customArg = process.argv[2];
  if (customArg && fs.existsSync(customArg)) {
    return path.resolve(customArg);
  }

  const candidates = [
    path.resolve(process.cwd(), 'jsondata.json'),
    path.resolve(__dirname, '../../jsondata.json'),
    path.resolve(__dirname, '../jsondata.json'),
    path.resolve(__dirname, '../data/jsondata.json'),
    path.resolve(__dirname, 'jsondata.json'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

async function runImport() {
  const isForce = process.argv.includes('--force') || process.argv.includes('--drop');

  console.info('==========================================');
  console.info('Blackcoffer Insights Data Ingestion Script');
  console.info('==========================================\n');

  const dataPath = findDataFile();
  if (!dataPath) {
    console.error(
      'Error: jsondata.json not found! Please place jsondata.json in the project root or provide the file path as an argument.',
    );
    console.info('Example usage: node backend/scripts/import-data.js ./jsondata.json');
    process.exit(1);
  }

  console.info(`Data source located: ${dataPath}`);
  console.info(`Connecting to MongoDB at: ${MONGODB_URI}`);

  try {
    await mongoose.connect(MONGODB_URI);
    console.info('MongoDB connection established.\n');

    const existingCount = await Insight.countDocuments();
    if (existingCount > 0 && !isForce) {
      console.warn(
        `[Idempotency Check] Collection 'insights' already contains ${existingCount} records.`,
      );
      console.info(
        'To overwrite and re-import data, rerun with the --force flag:\n  npm run seed -- --force\n',
      );
      await mongoose.disconnect();
      return;
    }

    if (existingCount > 0 && isForce) {
      console.info(`Dropping ${existingCount} existing records due to --force flag...`);
      await Insight.deleteMany({});
      console.info('Existing records cleared.\n');
    }

    console.info('Reading and parsing raw JSON data...');
    const rawContent = fs.readFileSync(dataPath, 'utf-8');
    const rawRecords = JSON.parse(rawContent);

    if (!Array.isArray(rawRecords) || rawRecords.length === 0) {
      console.warn('The JSON data file is empty or not an array.');
      await mongoose.disconnect();
      return;
    }

    console.info(`Found ${rawRecords.length} raw records. Normalizing...`);

    let nullPublishedCount = 0;
    const unspecifiedCounts = {
      region: 0,
      country: 0,
      sector: 0,
      pestle: 0,
      topic: 0,
      source: 0,
    };

    const normalizedDocs = rawRecords.map((item, index) => {
      const sector = normalizeString(item.sector);
      const topic = normalizeString(item.topic);
      const region = normalizeString(item.region);
      const country = normalizeString(item.country);
      const pestle = normalizeString(item.pestle);
      const source = normalizeString(item.source);

      if (sector === 'Unspecified') unspecifiedCounts.sector++;
      if (topic === 'Unspecified') unspecifiedCounts.topic++;
      if (region === 'Unspecified') unspecifiedCounts.region++;
      if (country === 'Unspecified') unspecifiedCounts.country++;
      if (pestle === 'Unspecified') unspecifiedCounts.pestle++;
      if (source === 'Unspecified') unspecifiedCounts.source++;

      // Parse dates
      const addedDate = parseCustomDate(item.added) || new Date();
      const publishedDate = parseCustomDate(item.published);

      if (!publishedDate) {
        nullPublishedCount++;
        const titleSnippet = item.title
          ? `"${item.title.substring(0, 60)}..."`
          : `Record #${index + 1}`;
        console.warn(
          `[Warning] Published date unparseable/empty for ${titleSnippet} (raw: "${item.published || ''}")`,
        );
      }

      return {
        end_year: normalizeNullableNumber(item.end_year),
        start_year: normalizeNullableNumber(item.start_year),
        impact: normalizeNullableNumber(item.impact),
        intensity: normalizeBoundedNumber(item.intensity, 0, 100, 0),
        likelihood: normalizeBoundedNumber(item.likelihood, 1, 10, 1),
        relevance: normalizeBoundedNumber(item.relevance, 1, 10, 1),
        sector,
        topic,
        region,
        country,
        pestle,
        source,
        title: item.title ? String(item.title).trim() : '',
        insight: item.insight ? String(item.insight).trim() : '',
        url: item.url ? String(item.url).trim() : '',
        added: addedDate,
        published: publishedDate,
      };
    });

    console.info(`\nInserting ${normalizedDocs.length} normalized documents into 'insights'...`);
    await Insight.insertMany(normalizedDocs, { ordered: false });

    const totalInserted = normalizedDocs.length;
    const formatPercent = (count) => ((count / totalInserted) * 100).toFixed(1);

    console.info('\n==========================================');
    console.info('         DATA INGESTION SUMMARY           ');
    console.info('==========================================');
    console.info(`Total records inserted : ${totalInserted}`);
    console.info(
      `Published date is null : ${nullPublishedCount} (${formatPercent(nullPublishedCount)}%)`,
    );
    console.info('------------------------------------------');
    console.info('Unspecified Fields Breakdown:');
    console.info(
      `  • Region      : ${unspecifiedCounts.region.toString().padStart(5)} (${formatPercent(unspecifiedCounts.region)}%)`,
    );
    console.info(
      `  • Country     : ${unspecifiedCounts.country.toString().padStart(5)} (${formatPercent(unspecifiedCounts.country)}%)`,
    );
    console.info(
      `  • Sector      : ${unspecifiedCounts.sector.toString().padStart(5)} (${formatPercent(unspecifiedCounts.sector)}%)`,
    );
    console.info(
      `  • Pestle      : ${unspecifiedCounts.pestle.toString().padStart(5)} (${formatPercent(unspecifiedCounts.pestle)}%)`,
    );
    console.info(
      `  • Topic       : ${unspecifiedCounts.topic.toString().padStart(5)} (${formatPercent(unspecifiedCounts.topic)}%)`,
    );
    console.info(
      `  • Source      : ${unspecifiedCounts.source.toString().padStart(5)} (${formatPercent(unspecifiedCounts.source)}%)`,
    );
    console.info('==========================================\n');

    await mongoose.disconnect();
    console.info('Import finished successfully and database connection closed.');
  } catch (error) {
    console.error('Import failed with error:', error);
    try {
      await mongoose.disconnect();
    } catch {
      // ignore
    }
    process.exit(1);
  }
}

void runImport();
