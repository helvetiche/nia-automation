# Cost-Optimized PDF Scanning - Implementation Tasks

## Phase 1: Core PDF Parsing Infrastructure

### 1.1 Create PDF Parser Service
- [ ] Create `lib/services/pdfParser.ts`
- [ ] Implement `parsePDF()` function using pdf-parse
- [ ] Extract text from all pages
- [ ] Preserve formatting and whitespace
- [ ] Handle errors and edge cases
- [ ] Add TypeScript interfaces for parsed data
- [ ] Write unit tests for parser

### 1.2 Create Table Detection Engine
- [ ] Create `lib/services/tableDetector.ts`
- [ ] Implement table pattern recognition algorithm
- [ ] Detect column headers from text
- [ ] Identify data rows
- [ ] Handle different table formats (aligned, delimited)
- [ ] Calculate confidence scores
- [ ] Write unit tests for detection

### 1.3 Create Data Extractor Service
- [ ] Create `lib/services/dataExtractor.ts`
- [ ] Implement column name normalization
- [ ] Parse numeric values from cells
- [ ] Handle currency symbols and units
- [ ] Extract data into structured format
- [ ] Implement total calculation logic
- [ ] Write unit tests for extraction

### 1.4 Create Confidence Validator
- [ ] Create `lib/services/confidenceValidator.ts`
- [ ] Implement validation checks
- [ ] Calculate confidence scores
- [ ] Determine AI fallback need
- [ ] Return validation results
- [ ] Write unit tests for validation

## Phase 2: AI Integration & Smart Routing

### 2.1 Create AI Validator Service
- [ ] Create `lib/services/aiValidator.ts`
- [ ] Implement lightweight AI validation prompt
- [ ] Add Gemini API integration
- [ ] Handle API errors gracefully
- [ ] Track API costs
- [ ] Write unit tests for AI validator

### 2.2 Implement Validation Caching
- [ ] Create Firestore collection for validation cache
- [ ] Implement cache key generation (PDF hash)
- [ ] Add cache retrieval logic
- [ ] Add cache storage logic
- [ ] Implement TTL (30 days)
- [ ] Write cache tests

### 2.3 Create Scan Orchestrator
- [ ] Create `lib/services/scanOrchestrator.ts`
- [ ] Implement workflow coordination
- [ ] Add strategy selection logic (fast vs thorough)
- [ ] Implement error handling and fallbacks
- [ ] Add cost tracking
- [ ] Write integration tests

### 2.4 Update Scan API Route
- [ ] Modify `/api/files/scan/route.ts`
- [ ] Replace Gemini-only logic with orchestrator
- [ ] Add strategy parameter support
- [ ] Update response format
- [ ] Add cost tracking to response
- [ ] Update error handling

## Phase 3: Database & Storage Updates

### 3.1 Update PDF Document Schema
- [ ] Add `scanMethod` field to PDFs collection
- [ ] Add `localConfidence` field
- [ ] Add `aiValidated` field
- [ ] Add `extractionCost` field
- [ ] Add `extractionDuration` field
- [ ] Create migration script for existing PDFs

### 3.2 Create Validation Cache Collection
- [ ] Create Firestore collection schema
- [ ] Add indexes for efficient queries
- [ ] Implement cache cleanup (TTL)
- [ ] Write collection tests

### 3.3 Update Usage Metrics
- [ ] Add `localScans` counter
- [ ] Add `aiScans` counter
- [ ] Add `hybridScans` counter
- [ ] Add `costSavings` tracker
- [ ] Add `averageConfidence` metric
- [ ] Update metrics calculation logic

## Phase 4: Frontend UI Updates

### 4.1 Update ScanOptionsModal
- [ ] Add "Fast Scan" option
- [ ] Add "Thorough Scan" option
- [ ] Show estimated cost for each
- [ ] Update icon imports (fix deprecated icons)
- [ ] Add strategy descriptions
- [ ] Write component tests

### 4.2 Update PdfViewer Component
- [ ] Add extraction method badge
- [ ] Display confidence score
- [ ] Show cost breakdown
- [ ] Highlight AI-corrected values
- [ ] Add loading states
- [ ] Write component tests

### 4.3 Create Cost Dashboard Component
- [ ] Create `components/console/CostDashboard.tsx`
- [ ] Display total cost savings
- [ ] Show scan method breakdown
- [ ] Display average confidence
- [ ] Show cost per scan trend
- [ ] Write component tests

## Phase 5: Testing & Optimization

### 5.1 Unit Tests
- [ ] Test PDF parser with various formats
- [ ] Test table detection algorithm
- [ ] Test column normalization
- [ ] Test total calculation
- [ ] Test confidence scoring
- [ ] Achieve 90%+ code coverage

### 5.2 Integration Tests
- [ ] Test end-to-end scan workflow
- [ ] Test local vs AI comparison
- [ ] Test cache validation
- [ ] Test error handling
- [ ] Test cost tracking
- [ ] Write integration test suite

### 5.3 Performance Tests
- [ ] Benchmark PDF parsing speed
- [ ] Measure memory usage
- [ ] Test concurrent scans
- [ ] Profile table detection
- [ ] Verify cost accuracy
- [ ] Document performance results

### 5.4 Optimization
- [ ] Optimize table detection algorithm
- [ ] Reduce memory footprint
- [ ] Improve parsing speed
- [ ] Cache frequently used data
- [ ] Profile and optimize hot paths

## Phase 6: Deployment & Monitoring

### 6.1 Prepare Rollout
- [ ] Create feature flag for new system
- [ ] Implement gradual rollout (10% → 50% → 100%)
- [ ] Set up monitoring dashboards
- [ ] Create alert rules
- [ ] Document rollback procedure

### 6.2 Deploy to Production
- [ ] Deploy Phase 1 code
- [ ] Monitor error rates
- [ ] Gather user feedback
- [ ] Deploy Phase 2 code
- [ ] Monitor cost savings
- [ ] Deploy Phase 3 code
- [ ] Deploy Phase 4 code

### 6.3 Monitor & Maintain
- [ ] Track local parsing success rate
- [ ] Monitor average confidence
- [ ] Track AI fallback rate
- [ ] Monitor cost per scan
- [ ] Track scan duration
- [ ] Respond to alerts

### 6.4 Documentation
- [ ] Write API documentation
- [ ] Create user guide for new features
- [ ] Document architecture decisions
- [ ] Create troubleshooting guide
- [ ] Update README

## Acceptance Criteria

### Phase 1 Complete When:
- All PDF parsing services implemented
- Unit tests passing (90%+ coverage)
- Local parsing < 2 seconds
- Confidence scoring working

### Phase 2 Complete When:
- AI validator integrated
- Caching working correctly
- Orchestrator coordinating workflow
- API route updated and tested

### Phase 3 Complete When:
- Database schema updated
- Migration script tested
- Metrics tracking working
- No data loss

### Phase 4 Complete When:
- UI components updated
- Deprecated icons fixed
- All components tested
- User feedback positive

### Phase 5 Complete When:
- 90%+ test coverage
- Performance targets met
- No regressions
- Documentation complete

### Phase 6 Complete When:
- Deployed to 100% of users
- Monitoring active
- Cost savings verified (70%+)
- User satisfaction high

## Success Metrics

- [ ] 70-80% cost reduction achieved
- [ ] 95%+ accuracy on structured documents
- [ ] < 2 second scan time (local only)
- [ ] < 12 second scan time (with AI)
- [ ] 99% uptime for local parsing
- [ ] User satisfaction 4.5+/5 stars
- [ ] Zero data loss during migration
- [ ] All tests passing
- [ ] Performance targets met
- [ ] Monitoring alerts working

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Local parsing fails on complex PDFs | AI fallback ensures accuracy |
| Performance degradation | Caching and optimization |
| Data loss during migration | Backup and rollback plan |
| User confusion with new options | Clear UI labels and docs |
| Unexpected API costs | Cost tracking and alerts |
