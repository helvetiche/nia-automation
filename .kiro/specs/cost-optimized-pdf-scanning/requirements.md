# Cost-Optimized PDF Scanning System

## Overview
Replace the current AI-heavy PDF scanning approach with a hybrid methodology that uses local PDF parsing for extraction and reserves AI for only complex validation and summarization tasks. This reduces API costs by 70-80% while maintaining accuracy.

## Current Problem
- Gemini API processes entire PDFs for every scan (~$0.15-$2.50 per PDF)
- All table extraction, parsing, and data validation done by AI
- Scales poorly with document volume
- No fallback for simple structured documents

## Proposed Solution
A three-tier scanning system:
1. **Tier 1 (Local Parsing)**: Use pdf-parse to extract raw text and structure
2. **Tier 2 (Smart Detection)**: Identify table patterns, column headers, and data rows locally
3. **Tier 3 (AI Validation)**: Only use Gemini for complex cases or confidence validation

## User Stories

### 1.1 User uploads PDF and system auto-detects table structure
**As a** user  
**I want** the system to automatically detect if a PDF has simple, structured tables  
**So that** I don't need to manually specify extraction methods

**Acceptance Criteria:**
- System analyzes PDF locally without AI
- Detects presence of tables and column headers
- Identifies data rows and numeric values
- Returns confidence score (0-100) for auto-detection
- Falls back to AI only if confidence < 60%

### 1.2 System extracts table data using local PDF parsing
**As a** system  
**I want** to extract table data using pdf-parse library  
**So that** I reduce API costs and improve speed

**Acceptance Criteria:**
- pdf-parse extracts text from all pages
- System identifies table boundaries and structure
- Column headers are detected and normalized
- Data rows are parsed into structured format
- Handles multi-page tables correctly
- Extraction completes in < 2 seconds

### 1.3 System calculates totals from extracted data
**As a** system  
**I want** to calculate Area, Irrigated Area, and Planted Area totals  
**So that** users get accurate summaries without AI processing

**Acceptance Criteria:**
- Identifies "Total" rows in tables
- Extracts numeric values from relevant columns
- Handles different column name variations (with/without spaces)
- Validates calculations against expected ranges
- Returns null if totals cannot be reliably extracted

### 1.4 System uses AI only for validation and complex cases
**As a** system  
**I want** to use Gemini API only when local parsing fails  
**So that** I minimize API costs while maintaining accuracy

**Acceptance Criteria:**
- AI is called only if local confidence < 60%
- AI validates extracted data against original PDF
- AI handles scanned PDFs or complex layouts
- AI response is cached to avoid duplicate calls
- Cost tracking shows 70%+ reduction vs current method

### 1.5 User can choose scanning strategy
**As a** user  
**I want** to choose between fast (local-only) or thorough (with AI validation)  
**So that** I can balance speed and accuracy based on my needs

**Acceptance Criteria:**
- UI offers "Fast Scan" (local only) option
- UI offers "Thorough Scan" (local + AI validation) option
- Fast Scan completes in < 2 seconds
- Thorough Scan completes in < 10 seconds
- Cost difference is clearly shown to user

### 1.6 System tracks and reports cost savings
**As a** user  
**I want** to see how much I'm saving with the new system  
**So that** I understand the value of cost optimization

**Acceptance Criteria:**
- Dashboard shows estimated cost per scan
- Displays total API calls avoided
- Shows cost comparison (old vs new method)
- Tracks local parsing success rate
- Monthly savings report available

## Technical Requirements

### PDF Parsing
- Use pdf-parse to extract text from all pages
- Preserve text layout and spacing information
- Handle both text-based and scanned PDFs
- Support PDFs up to 50MB

### Table Detection
- Identify table structures from text patterns
- Detect column headers and alignment
- Recognize data rows and numeric values
- Handle merged cells and complex layouts

### Data Extraction
- Parse numeric values with proper formatting
- Handle currency symbols and units
- Normalize column names (remove underscores, standardize spacing)
- Validate extracted data types

### AI Integration
- Call Gemini only when confidence < 60%
- Use lightweight prompts for validation
- Cache AI responses to avoid duplicate processing
- Track API usage and costs

### Performance
- Local parsing: < 2 seconds per PDF
- AI validation: < 8 seconds per PDF
- Total scan time: < 10 seconds
- Memory usage: < 100MB per PDF

## Success Metrics
- 70-80% reduction in API costs
- 95%+ accuracy on structured documents
- < 2 second scan time for local-only
- 99% uptime for local parsing
- User satisfaction: 4.5+/5 stars

## Implementation Phases

### Phase 1: Local PDF Parsing
- Implement pdf-parse integration
- Build table detection algorithm
- Create data extraction logic
- Add confidence scoring

### Phase 2: Smart Routing
- Implement confidence-based AI fallback
- Add cost tracking
- Create user preferences for scan strategy
- Build cost reporting dashboard

### Phase 3: Optimization
- Cache AI responses
- Optimize parsing performance
- Add support for more table formats
- Implement batch processing

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Local parsing fails on complex PDFs | Medium | AI fallback ensures accuracy |
| Column name variations cause errors | Medium | Fuzzy matching and normalization |
| Performance degrades with large PDFs | Low | Streaming and chunking |
| Users confused by new options | Low | Clear UI labels and tooltips |

## Out of Scope
- OCR for scanned PDFs (use AI for this)
- Advanced data validation rules
- Custom table format support
- Historical data migration
