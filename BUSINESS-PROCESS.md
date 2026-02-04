# NIA-AUTOMATION Business Process

## Folder Management System

### Folder Structure
The system uses a hierarchical folder-based organization with the following rules:

- Users can create root-level folders
- Users can create subfolders within existing folders
- Maximum folder depth: 4 levels (branches)
- Each folder can contain PDF files and subfolders

**Example Structure:**
```
Root Folder (Level 1)
├── Subfolder A (Level 2)
│   ├── Subfolder A1 (Level 3)
│   │   └── Subfolder A1a (Level 4) [Maximum depth]
│   └── Subfolder A2 (Level 3)
└── Subfolder B (Level 2)
```

### Folder Operations

#### Creating Folders
1. User clicks "Create Folder" button
2. System prompts for folder name
3. System validates folder depth (must not exceed 4 levels)
4. Folder is created and displayed in the hierarchy

#### Navigating Folders
1. User clicks on any folder to view its contents
2. System displays:
   - Subfolders within the selected folder
   - PDF files within the selected folder
   - Breadcrumb navigation showing current path

## File Upload System

### Uploading PDF Files

1. User navigates to desired folder
2. User clicks "Upload PDF" button
3. User selects one or multiple PDF files (up to 10 files per upload)
4. System uploads files to Firebase Storage via backend API
5. Each PDF is assigned:
   - Unique file ID
   - Parent folder reference
   - Upload timestamp
   - Initial status: "unscanned"

### File Status Management

Each PDF file has two possible statuses:

- **Unscanned**: PDF uploaded but not yet processed by AI
- **Scanned**: PDF has been processed and content extracted to database

Status is displayed visually in the file list (badge, icon, or color indicator).

## Folder Selection and Bulk Operations

### Selecting Folder Contents

1. User clicks on a folder
2. System displays all PDF files within that folder
3. User can select individual PDFs or "Select All PDFs in Folder"
4. Selection includes only PDF files (not subfolders)
5. User can perform bulk operations on selected PDFs:
   - Scan multiple PDFs at once
   - Delete multiple PDFs
   - Move to another folder

## PDF Scanning Process

### Scanning Workflow

1. User selects one or more PDF files
2. User clicks "Scan" button
3. System initiates AI processing:
   - Backend sends PDF to Gemini 3 Flash API
   - AI extracts table content from each page
   - AI converts PDF pages to images (screenshots)
   - Content is structured and stored in Firestore
4. System updates PDF status from "unscanned" to "scanned"
5. User receives notification when scanning completes

### Data Storage After Scanning

For each scanned PDF, the system stores:

**PDF Document Record:**
- PDF ID
- File name
- Folder location
- Status: "scanned"
- Scan timestamp
- Total page count

**Page-Level Data (stored separately):**
- PDF ID (reference to parent PDF)
- Page number
- Extracted table content (structured data)
- Page screenshot (image URL from Firebase Storage)
- AI confidence score (optional)

**Database Structure Example:**
```
pdfs/
  {pdfId}/
    - name: "document.pdf"
    - folderId: "folder123"
    - status: "scanned"
    - pageCount: 15
    - scannedAt: timestamp

pages/
  {pdfId}_page_1/
    - pdfId: "pdf123"
    - pageNumber: 1
    - tableData: {...}
    - screenshotUrl: "storage/screenshots/..."
  {pdfId}_page_2/
    - pdfId: "pdf123"
    - pageNumber: 2
    - tableData: {...}
    - screenshotUrl: "storage/screenshots/..."
```

## Viewing Scanned PDF Content

### View Button Functionality

1. User clicks "View" button on a scanned PDF
2. System opens a modal/dialog displaying PDF content
3. Modal shows:
   - PDF file name and metadata
   - Page navigation controls
   - Current page content

### Content Display Modal

**Modal Components:**

**Header:**
- PDF file name
- Total page count
- Close button

**Content Area:**
- Table data extracted from current page (displayed in HTML table format)
- Page screenshot (side-by-side or toggle view)
- AI-extracted data vs original image comparison

**Pagination Controls:**
- Previous Page button
- Page number indicator (e.g., "Page 3 of 15")
- Next Page button
- Jump to specific page (dropdown or input)

### Page-by-Page Navigation

- Each page of the PDF is treated as a separate record
- User navigates through pages using pagination controls
- System loads page data from database (not re-scanning)
- Only one page displayed at a time for clarity
- Smooth transitions between pages

**Pagination Behavior:**
- Previous button disabled on page 1
- Next button disabled on last page
- Page numbers start at 1 (not 0)
- Keyboard shortcuts: Arrow keys for navigation

### Content Presentation

**Table Data Display:**
- Extracted table content shown in clean, formatted HTML table
- Columns and rows preserved from AI extraction
- Responsive table design for different screen sizes

**Screenshot Display:**
- Original PDF page image shown for verification
- Zoom controls for detailed inspection
- Download option for individual page screenshots

**Layout Options:**
- Side-by-side: Table data on left, screenshot on right
- Tabbed view: Switch between "Extracted Data" and "Original Image"
- Overlay mode: Screenshot with extracted data highlighted

## User Workflow Summary

### Complete User Journey

1. **Setup Phase**
   - Create folder structure (up to 4 levels deep)
   - Organize folders by project, date, or category

2. **Upload Phase**
   - Navigate to target folder
   - Upload PDF files (batch upload supported)
   - Files appear with "unscanned" status

3. **Processing Phase**
   - Select folder or individual PDFs
   - Click "Scan" to process files
   - AI extracts content and generates screenshots
   - Status changes to "scanned"

4. **Review Phase**
   - Click "View" on scanned PDF
   - Navigate through pages using pagination
   - Review extracted table data
   - Compare with original screenshots
   - Verify AI accuracy

5. **Management Phase**
   - Move files between folders
   - Delete unwanted files
   - Re-scan if needed
   - Export or summarize data

## Key Features

### Folder Management
- Hierarchical organization (4-level depth)
- Drag-and-drop folder creation
- Breadcrumb navigation
- Folder renaming and deletion

### File Management
- Bulk upload (up to 10 files)
- Status tracking (scanned/unscanned)
- File metadata display
- Move and delete operations

### AI Processing
- Gemini 3 Flash integration
- Table extraction from PDFs
- Page-to-image conversion
- Structured data storage

### Content Viewing
- Modal-based viewer
- Page-by-page pagination
- Side-by-side comparison
- Screenshot verification

### Data Integrity
- All content stored in Firestore
- Screenshots stored in Firebase Storage
- No re-scanning needed for viewing
- Persistent data across sessions

## Technical Considerations

### Performance
- Lazy loading for large PDFs
- Pagination prevents memory overload
- Image optimization for screenshots
- Cached data for faster viewing

### Security
- Backend-only Firebase operations
- Service account for storage access
- User authentication required
- Folder-level permissions (future)

### Scalability
- Supports multiple concurrent scans
- Efficient database queries
- Optimized storage usage
- Batch operations for bulk actions
