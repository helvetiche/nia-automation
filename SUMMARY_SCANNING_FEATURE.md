# Summary Scanning Feature

## Overview
The Summary Scanning feature extracts irrigation association data from specific pages of PDF documents, creating a grid view of irrigation associations with their total areas.

## How It Works

### 1. Scan Options Modal
- Users can now choose between two scan types:
  - **Total Scanning**: Extracts totals from the last page (existing feature)
  - **Summary Scanning**: Extracts irrigation association data from specific pages (new feature)

### 2. Summary Scanning Process
- User selects "Summary Scanning" and specifies page numbers (e.g., "1", "1,3,5", "1-5")
- AI looks for "Irrigation Association" names and "Total Area" values
- Creates structured data with association names and their corresponding areas

### 3. Data Display

#### Grid View (FileGrid)
- Shows "Summary Scanned" status with blue indicator
- Displays first 3 associations with their areas
- Shows "+X more associations" if there are more than 3
- Includes association count badge

#### Table View (FileList)
- Shows association count and total combined area
- Maintains consistent styling with existing features

### 4. Summary View Modal
- Large modal displaying all associations in a grid format
- Each association card shows:
  - Association name
  - Total area
  - Confidence score
  - Token usage (divided equally among associations)
- Summary statistics at the bottom

## Technical Implementation

### Database Schema
- Added `summaryData` field to PdfFile type
- Added `summary-scanned` status
- Added `scanType` field to track scan method

### API Changes
- Updated `/api/files/scan` to handle both scan types
- Different AI prompts for each scan type
- Proper token usage calculation for summary scans

### UI Components
- Updated ScanOptionsModal with scan type selection
- Created SummaryGrid component for displaying associations
- Created SummaryViewModal for detailed view
- Updated FileGrid and FileList to handle summary data

## Usage
1. Click scan button on any PDF
2. Select "Summary Scanning" 
3. Enter page numbers to scan
4. View results in grid or table view
5. Click "View Associations" to see detailed breakdown

## Benefits
- Focused extraction of irrigation association data
- Better organization of association information
- Maintains token efficiency by scanning only specified pages
- Consistent UI/UX with existing features