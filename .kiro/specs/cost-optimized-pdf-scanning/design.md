# Cost-Optimized PDF Scanning - Design Document

## Architecture Overview

```
User Upload
    ↓
[PDF Storage]
    ↓
[Local PDF Parser] ← pdf-parse library
    ↓
[Table Detection Engine]
    ↓
[Confidence Scorer] → If confidence >= 60% → [Store Results]
    ↓                                              ↑
    └─→ If confidence < 60% → [AI Validator] ────┘
                                    ↓
                            [Gemini API Call]
                                    ↓
                            [Cache Response]
                                    ↓
                            [Store Results]
```

## Core Components

### 1. PDF Parser Service (`lib/services/pdfParser.ts`)

**Responsibility**: Extract raw text and structure from PDF files

```typescript
interface ParsedPDF {
  pages: ParsedPage[];
  totalPages: number;
  extractedAt: number;
  rawText: string;
}

interface ParsedPage {
  pageNumber: number;
  text: string;
  tables: DetectedTable[];
  confidence: number;
}

interface DetectedTable {
  pageNumber: number;
  headers: string[];
  rows: Record<string, string>[];
  confidence: number;
  bounds?: { top: number; left: number; width: number; height: number };
}

async function parsePDF(filePath: string): Promise<ParsedPDF>
async function extractText(buffer: Buffer): Promise<string>
```

**Implementation Details**:
- Use pdf-parse to extract text from buffer
- Preserve whitespace and line breaks for table detection
- Return structured data with page-level granularity
- Handle errors gracefully with fallback to AI

### 2. Table Detection Engine (`lib/services/tableDetector.ts`)

**Responsibility**: Identify table structures from parsed text

```typescript
interface TablePattern {
  headerRow: string[];
  dataRows: string[][];
  confidence: number;
  type: 'aligned' | 'delimited' | 'structured';
}

async function detectTables(text: string, pageNumber: number): Promise<DetectedTable[]>
async function normalizeHeaders(headers: string[]): Promise<string[]>
async function parseDataRows(rows: string[], headers: string[]): Promise<Record<string, string>[]>
```

**Algorithm**:
1. Split text into lines
2. Identify potential header rows (lines with multiple words/numbers)
3. Detect column alignment or delimiters
4. Group consecutive data rows
5. Validate table structure
6. Calculate confidence score

**Confidence Scoring**:
- Header detection: +20 points
- Consistent column count: +20 points
- Numeric data in expected columns: +20 points
- Row count > 2: +20 points
- No parsing errors: +20 points
- **Total**: 0-100 scale

### 3. Data Extractor (`lib/services/dataExtractor.ts`)

**Responsibility**: Extract and normalize data from detected tables

```typescript
interface ExtractedData {
  pages: ExtractedPage[];
  totals: {
    totalArea: number | null;
    totalIrrigatedArea: number | null;
    totalPlantedArea: number | null;
  };
  confidence: number;
  method: 'local' | 'ai';
}

interface ExtractedPage {
  pageNumber: number;
  tableData: Record<string, unknown>[];
  summary: string;
}

async function extractData(tables: DetectedTable[]): Promise<ExtractedData>
async function calculateTotals(tables: DetectedTable[]): Promise<Totals>
async function normalizeColumnNames(headers: string[]): Promise<string[]>
```

**Column Name Normalization**:
- Remove underscores and replace with spaces
- Standardize capitalization
- Handle variations: "Area" / "Total Area" / "TOTAL_AREA"
- Map to canonical names: "Area", "Irrigated Area", "Planted Area"

**Total Calculation**:
1. Find rows with "Total" in any column (case-insensitive)
2. Skip "Subtotal" rows unless on last page
3. Extract numeric values from relevant columns
4. Validate against expected ranges
5. Return null if extraction fails

### 4. Confidence Validator (`lib/services/confidenceValidator.ts`)

**Responsibility**: Determine if local parsing is sufficient or AI is needed

```typescript
interface ValidationResult {
  confidence: number;
  needsAI: boolean;
  issues: string[];
  recommendations: string[];
}

async function validateExtraction(data: ExtractedData): Promise<ValidationResult>
async function scoreConfidence(data: ExtractedData): Promise<number>
```

**Validation Checks**:
- Table structure integrity
- Data type consistency
- Numeric value ranges
- Column header clarity
- Row count reasonableness
- Missing or null values

**Decision Logic**:
```
if confidence >= 60:
  return { needsAI: false, confidence }
else:
  return { needsAI: true, confidence }
```

### 5. AI Validator Service (`lib/services/aiValidator.ts`)

**Responsibility**: Use Gemini API only for validation or complex cases

```typescript
interface AIValidationRequest {
  pdfBuffer: Buffer;
  localExtraction: ExtractedData;
  confidence: number;
}

interface AIValidationResponse {
  validated: boolean;
  corrections: Record<string, unknown>;
  confidence: number;
  cost: number;
}

async function validateWithAI(request: AIValidationRequest): Promise<AIValidationResponse>
async function getCachedValidation(pdfHash: string): Promise<AIValidationResponse | null>
async function cacheValidation(pdfHash: string, response: AIValidationResponse): Promise<void>
```

**AI Prompt** (lightweight):
```
Validate this extracted table data against the PDF:
- Confirm column headers are correct
- Verify numeric values are accurate
- Check for missing rows
- Suggest corrections if needed

Extracted Data:
[JSON of local extraction]

Return JSON with: { validated: boolean, corrections: {}, confidence: 0-100 }
```

**Caching Strategy**:
- Hash PDF content (first 1MB)
- Store validation results in Firestore
- TTL: 30 days
- Avoid duplicate API calls

### 6. Scan Orchestrator (`lib/services/scanOrchestrator.ts`)

**Responsibility**: Coordinate the scanning workflow

```typescript
interface ScanRequest {
  pdfId: string;
  userId: string;
  strategy: 'fast' | 'thorough';
  aiModel?: string;
}

interface ScanResult {
  success: boolean;
  data: ExtractedData;
  method: 'local' | 'ai';
  confidence: number;
  cost: number;
  duration: number;
}

async function executeScan(request: ScanRequest): Promise<ScanResult>
```

**Workflow**:
1. Download PDF from storage
2. Parse PDF locally
3. Detect tables
4. Extract data
5. Calculate confidence
6. If strategy === 'fast' OR confidence >= 60:
   - Return local results
7. Else:
   - Check cache for validation
   - Call AI validator if not cached
   - Merge AI corrections
8. Store results in Firestore
9. Update folder totals
10. Return results

## API Route Changes

### `/api/files/scan` (Updated)

**Request**:
```json
{
  "pdfId": "string",
  "strategy": "fast" | "thorough",
  "aiModel": "gemini-2.5-flash-lite"
}
```

**Response**:
```json
{
  "success": true,
  "pageCount": 5,
  "method": "local",
  "confidence": 85,
  "cost": 0.001,
  "duration": 1.2,
  "totals": {
    "totalArea": 1000,
    "totalIrrigatedArea": 800,
    "totalPlantedArea": 750
  }
}
```

## Database Schema Updates

### PDFs Collection
```typescript
{
  // ... existing fields
  scanMethod: 'local' | 'ai' | 'hybrid';
  localConfidence: number;
  aiValidated: boolean;
  extractionCost: number;
  extractionDuration: number;
}
```

### New: Validation Cache Collection
```typescript
{
  id: string; // pdfHash
  pdfHash: string;
  validationResult: AIValidationResponse;
  createdAt: number;
  expiresAt: number;
}
```

### Usage Metrics (Updated)
```typescript
{
  // ... existing fields
  localScans: number;
  aiScans: number;
  hybridScans: number;
  costSavings: number;
  averageConfidence: number;
}
```

## UI Components

### ScanOptionsModal (Updated)
- Add "Fast Scan" option (local only)
- Add "Thorough Scan" option (local + AI)
- Show estimated cost for each option
- Display confidence score after scan

### PdfViewer (Updated)
- Show extraction method badge
- Display confidence score
- Show cost breakdown
- Highlight AI-corrected values

## Performance Targets

| Operation | Target | Method |
|-----------|--------|--------|
| PDF Parse | < 2s | pdf-parse with streaming |
| Table Detection | < 1s | Regex + pattern matching |
| Data Extraction | < 0.5s | Direct parsing |
| Confidence Scoring | < 0.5s | Rule-based calculation |
| AI Validation | < 8s | Gemini API |
| **Total (Local)** | **< 4s** | Parallel processing |
| **Total (Hybrid)** | **< 12s** | Sequential with AI |

## Cost Analysis

### Current System
- Per PDF: $0.15 - $2.50 (Gemini API)
- 1000 PDFs/month: $150 - $2,500

### New System (Local Only)
- Per PDF: $0.001 (storage + compute)
- 1000 PDFs/month: $1

### New System (Hybrid - 20% AI fallback)
- Per PDF: $0.031 (80% local + 20% AI)
- 1000 PDFs/month: $31

### Savings
- **Local Only**: 99% cost reduction
- **Hybrid**: 98% cost reduction
- **Payback Period**: < 1 month

## Error Handling

### Local Parsing Failures
- Log error with PDF details
- Automatically fallback to AI
- Notify user of fallback
- Track failure rate

### AI Validation Failures
- Return local results with lower confidence
- Log error for debugging
- Retry with exponential backoff
- Alert on repeated failures

### Data Validation Failures
- Return partial results
- Flag problematic columns
- Suggest manual review
- Provide raw extracted data

## Testing Strategy

### Unit Tests
- Table detection algorithm
- Column name normalization
- Total calculation logic
- Confidence scoring

### Integration Tests
- End-to-end scan workflow
- Local vs AI comparison
- Cache validation
- Error handling

### Performance Tests
- Parse time benchmarks
- Memory usage profiling
- Concurrent scan handling
- Cost tracking accuracy

## Rollout Plan

### Phase 1: Beta (Week 1-2)
- Deploy to 10% of users
- Monitor error rates and costs
- Gather feedback

### Phase 2: Gradual (Week 3-4)
- Deploy to 50% of users
- Fine-tune algorithms
- Optimize performance

### Phase 3: Full (Week 5+)
- Deploy to 100% of users
- Maintain legacy option for 30 days
- Monitor metrics

## Monitoring & Observability

### Key Metrics
- Local parsing success rate
- Average confidence score
- AI fallback rate
- Cost per scan
- Scan duration
- User satisfaction

### Alerts
- Local parsing failure rate > 5%
- Average confidence < 70%
- AI fallback rate > 30%
- Scan duration > 15s
- Cost per scan > $0.50

### Dashboards
- Real-time scan metrics
- Cost savings tracker
- Error rate monitor
- Performance benchmarks
