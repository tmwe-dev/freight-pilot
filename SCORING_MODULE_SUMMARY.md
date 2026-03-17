# Composite Scoring Module - Implementation Summary

## Overview
A complete 5-dimension scoring system for the Freight Pilot CRM project that calculates composite scores for both partners and prospects. The module evaluates entities across five dimensions with adjustable weights and provides visualization through an interactive dashboard.

## Files Created

### 1. Core Scoring Engine: `src/lib/scoring/scoringEngine.ts`

**Key Components:**

#### Interfaces
- `DimensionScore`: Single dimension score data
- `ScoringResult`: Complete scoring result with total and dimension breakdown
- `ScoringConfig`: Scoring configuration stored in Supabase

#### Scoring Functions

**Five Dimensions:**

1. **Data Quality (20% default weight)**
   - `calculateDataQuality(entity)` → 0-100
   - Measures: email, phone, address, mobile, partner contacts presence
   - Returns percentage of available fields

2. **Commercial Potential (30% default weight)**
   - `calculateCommercialPotential(entity)` → 0-100
   - Measures: company size (employees), revenue, partner type, WCA membership, certifications
   - Logarithmic scoring for revenue and employee count

3. **Strategic Relevance (25% default weight)**
   - `calculateStrategicRelevance(entity)` → 0-100
   - Measures: geographic coverage, branch presence, service alignment, profile completeness
   - Geographic diversity awards additional points

4. **Circuit Status (15% default weight)**
   - `calculateCircuitStatus(entity)` → 0-100
   - Measures: lead status progression, activity recency (< 7 days = best), interaction count
   - Status weights: converted(40), hot(35), warm(25), interested(30), contacted(20), cold(10)

5. **Risk (10% default weight)**
   - `calculateRisk(entity)` → 0-100 (100 = low risk)
   - Measures: blacklist proximity, data staleness, low engagement
   - Inverted scoring (lower raw points = higher final score)

#### Main Functions

- `calculateScore(entity, entityType, config?)` → ScoringResult
  - Calculates all 5 dimensions and returns weighted composite score (0-100)
  - Supports optional custom configuration from database

- `batchScorePartners()` → { updated: number; error?: string }
  - Scores all partners in the system
  - Updates `priority_score` field in partners table
  - Fetches scoring config from Supabase

- `batchScoreProspects()` → { updated: number; error?: string }
  - Scores all prospects in the system
  - Updates `priority_score` field in prospects table

**Default Weights:**
```
Data Quality: 20%
Commercial Potential: 30%
Strategic Relevance: 25%
Circuit Status: 15%
Risk: 10%
TOTAL: 100%
```

### 2. React Hooks: `src/hooks/useScoring.ts`

**Query Hooks (read-only):**

- `useScoringConfig()`
  - Fetches active scoring configurations from `scoring_config` table
  - 5-minute cache
  - Returns `ScoringConfig[]`

- `useEntityScore(entityType, entityId)`
  - Calculates score for a single entity
  - Returns `{ entity, score: ScoringResult }` or null
  - Enabled only when entityId is provided

- `useScoredPartners()`
  - Returns top 100 scored partners
  - Includes: id, company_name, priority_score, lead_status, country_code, city, last_interaction_at, interaction_count
  - Ordered by score descending

- `useScoredProspects()`
  - Returns top 100 scored prospects
  - Same fields as partners

- `useAverageDimensionScores(entityType)`
  - Calculates average score for each dimension across all entities
  - Returns array of 5 dimensions with average values
  - Useful for benchmark comparison

**Mutation Hooks (write operations):**

- `useUpdateScoringConfig()`
  - Updates dimension weights in database
  - Input: `Array<{ id, weight?, rules? }>`
  - Invalidates `scoring-config` query on success

- `useBatchScore()`
  - Triggers batch scoring for all partners and prospects
  - Returns count of updated entities
  - Invalidates partners, prospects, and entity-score queries on success

### 3. Dashboard Page: `src/pages/ScoringDashboard.tsx`

**Features:**

**Header**
- Title: "Scoring Composito"
- "Ricalcola Tutti" button to trigger batch scoring

**Dimension Overview Cards (5 cards)**
- Each dimension shows:
  - Dimension name (Italian labels)
  - Current average score across all entities
  - Adjustable weight slider (0-50%)

**Radar Chart**
- Shows 5-dimension profile for selected entity
- Interactive polar grid visualization
- Real-time updates when entity is selected

**Score Distribution Histogram**
- Bar chart showing entity distribution by score ranges
- Ranges: 0-20, 21-40, 41-60, 61-80, 81-100
- Shows concentration of scores

**Top Scored Entities Table**
- Lists top 20 scored partners/prospects
- Columns: Name, Score (with visual bar), Status, Country, Interactions
- Clickable rows to select entity and update radar chart
- Color-coded status badges:
  - Converted: green
  - Hot: red
  - Other: yellow

**Tabs**
- Switch between Partner and Prospect views
- Shows count of entities in each tab

**Configuration Panel**
- Displays all 5 dimensions with weight sliders
- Shows total weight percentage (must sum to 100%)
- Save and Cancel buttons
- Only enabled when sum equals 100%

**Dark Theme**
- Slate/blue color scheme
- Gradient backgrounds
- Responsive layout (grid-based)

## Integration Points

### Database Tables Required

1. **scoring_config** (already exists)
   - Fields: id, dimension, weight, rules, is_active, created_at, updated_at
   - 5 rows (one per dimension)

2. **partners** (existing)
   - Needs `priority_score` field (can be added via migration)
   - Used fields: email, phone, mobile, address, country_code, city, lead_status, last_interaction_at, interaction_count, wca_id, partner_type, has_branches, branch_cities, enrichment_data, enriched_at, updated_at, is_active, profile_description, rating_details

3. **prospects** (existing)
   - Needs `priority_score` field (can be added via migration)
   - Used fields: email, phone, address, country_code, city, lead_status, last_interaction_at, interaction_count, dipendenti, fatturato, descrizione_ateco, updated_at, profile_description, rating_affidabilita, enrichment_data

### Supabase Client
- Uses existing `supabase` client from `@/integrations/supabase/client`
- All queries use standard `from().select()` patterns

## Route Addition

**App.tsx Changes:**
- Added lazy import: `const ScoringDashboard = lazy(() => import("./pages/ScoringDashboard"));`
- Added route: `<Route path="/scoring" element={<ScoringDashboard />} />`
- Protected by `ProtectedRoute` and `AppLayout` wrapper

## Dependencies

**Existing in Project:**
- `@tanstack/react-query` - Data fetching and caching
- `@supabase/supabase-js` - Database client
- `recharts` - Data visualization
- `lucide-react` - Icons
- `shadcn/ui` - UI components (Card, Button, Slider, Tabs)
- `framer-motion` - Already in project (optional use)
- `sonner` - Toast notifications

## TypeScript Configuration

- All `any` types replaced with `Record<string, unknown>` for type safety
- Full ESLint compliance
- React Hook dependencies properly declared
- Proper typing for Supabase responses

## Build Output

- Successfully compiles with TypeScript
- ScoringDashboard chunk: ~416KB (uncompressed), 112KB (gzipped)
- All linting passes (zero errors, zero warnings)
- Production build verified

## Usage Examples

### Calculate Score for Single Entity
```typescript
import { calculateScore } from '@/lib/scoring/scoringEngine';

const entity = { /* partner or prospect data */ };
const result = calculateScore(entity, 'partner');
console.log(result.total); // 0-100 score
console.log(result.dimensions); // Array of DimensionScore
```

### Use in React Component
```typescript
import { useEntityScore } from '@/hooks/useScoring';

function MyComponent() {
  const { data: scoreData } = useEntityScore('partner', partnerId);

  return (
    <div>
      Score: {scoreData?.score.total}
      Dimensions: {scoreData?.score.dimensions.map(d => ...)}
    </div>
  );
}
```

### Batch Score All Entities
```typescript
import { useBatchScore } from '@/hooks/useScoring';

function ScoringButton() {
  const { mutate: batchScore, isPending } = useBatchScore();

  return (
    <button onClick={() => batchScore()}>
      {isPending ? 'Scoring...' : 'Score All'}
    </button>
  );
}
```

## Future Enhancements

1. **Custom Rules Engine**: Allow users to define complex custom rules for each dimension
2. **Scoring History**: Track score changes over time with historical data
3. **Dimension Insights**: Show which factors are driving scores up/down
4. **Predictive Scoring**: Use machine learning to identify high-conversion entities
5. **Export Functionality**: CSV/Excel export of scored entities with breakdowns
6. **Email Alerts**: Notify when entities reach certain score thresholds
7. **A/B Testing**: Test different weight configurations for optimal results
8. **Segment Analysis**: Compare scores by country, industry, or custom segments

## Notes

- Scoring logic is stateless and can be called independently
- Batch operations use chunked updates (100 at a time) to avoid database limits
- All scores are cached and invalidated on updates
- The system is designed to be extensible for additional dimensions in the future
- Risk dimension uses inverted logic (raw points = risk, subtracted from 100)
