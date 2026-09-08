# Data Quality Notes

## Ingestion & Normalization

This document details data hygiene and transformation considerations for the analytics dataset.

### Key Considerations

1. **Missing / Empty Values**:
   - Fields such as `end_year`, `start_year`, `country`, `region`, and `city` may be empty strings or `null` in raw source feeds.
   - The query service and aggregation pipelines should sanitize empty strings to `null` or explicit `"Unknown"` fallback categories during import and querying.
2. **Numeric Castings**:
   - Metrics like `intensity`, `likelihood`, and `relevance` must be parsed as positive numbers with bounded defaults.
3. **Date Formats**:
   - Date timestamps (`added`, `published`) should be standardized to ISO-8601 strings or valid `Date` objects in MongoDB.
4. **Categorical Fields**:
   - String fields such as `sector`, `topic`, `pestle`, `source`, and `swot` should be trimmed of leading/trailing whitespace.
