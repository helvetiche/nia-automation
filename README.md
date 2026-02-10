# NIA Automation System

**Operations & Maintenance System for Agricultural Document Management**

---

## Table of Contents

- [What This System Does](#what-this-system-does)
- [Getting Started](#getting-started)
- [Main Features](#main-features)
- [Step-by-Step Tutorials](#step-by-step-tutorials)
- [Understanding Your Data](#understanding-your-data)
- [Tips for Best Results](#tips-for-best-results)
- [Troubleshooting](#troubleshooting)

---

## What This System Does

The NIA Automation System helps you manage and process PDF documents containing agricultural data. It organizes files into folders, scans PDFs to extract information about land areas, and generates reports based on that data.

**Think of it as a digital filing cabinet that can also read and understand your documents automatically.**

### Key Benefits

- **Save Time** - Automatically extract data from PDFs instead of manual entry
- **Stay Organized** - Keep all documents in structured folders
- **Generate Reports** - Create Excel reports with one click
- **Track Changes** - Add notes and track document history
- **Work Together** - Multiple users can access the system simultaneously

---

## Getting Started

### Accessing the System

1. Open your web browser
2. Navigate to the system URL (provided by your administrator)
3. Enter your email address and password
4. Click **Sign In**

> **Note:** Only authorized personnel can access the system. If you don't have login credentials, contact your system administrator.

### First Time Setup

When you first log in, you'll see:

- **Sidebar** - Shows your folder structure
- **Main Area** - Displays files and folders
- **Ribbon** - Contains action buttons (Upload, Scan, Report, etc.)
- **Header** - Shows your profile and logout option

### Logging Out

1. Click your profile icon in the top-right corner
2. Select **Logout**
3. You'll be returned to the login page

> **Security Tip:** Always log out when you're done, especially on shared computers.

---

## Main Features

### Folder Management

**Create organized folder structures to keep your documents sorted**

- Create folders and subfolders
- Choose custom icons and colors for easy identification
- Move folders to reorganize your structure
- Add notes to folders for reference
- Delete folders when no longer needed

### File Management

**Upload and organize your PDF documents**

- Upload single or multiple PDF files
- Rename files to keep things clear
- Move files between folders
- Add notes to individual files
- Delete files you no longer need
- View file details and status

### Document Scanning

**Automatically extract data from your PDFs**

- **Total Scan** - Process entire documents
- **Summary Scan** - Process specific pages only
- View extracted data in tables
- Edit extracted information if needed
- See confidence scores for accuracy
- Add or remove associations manually

### Report Generation

**Create Excel reports from your scanned data**

- Generate reports from selected files
- Customize report formatting
- Use custom Excel templates
- Preview before downloading
- Combine multiple files into one report

### View Modes

**Choose how you want to see your files**

- **Grid View** - Visual cards with thumbnails
- **Table View** - Detailed list with all information
- Switch between views anytime

---

## Step-by-Step Tutorials

### Tutorial 1: Creating Your First Folder

**Time: 2 minutes**

1. Look at the left sidebar
2. Click the **New Folder** button at the top
3. A dialog box appears - fill in:
   - **Name:** Enter a descriptive name (e.g., "2024 Reports")
   - **Description:** Add optional details (e.g., "Annual irrigation reports")
   - **Parent Folder:** Choose where to place it (or leave as Root)
   - **Icon:** Pick an icon that represents the folder
   - **Color:** Choose a color for easy identification
4. Click **Create**
5. Your new folder appears in the sidebar

**Tips:**
- Use clear, descriptive names
- Choose colors that make sense (e.g., blue for water-related documents)
- Create a logical hierarchy before uploading files

---

### Tutorial 2: Uploading and Scanning PDFs

**Time: 5-10 minutes (depending on file size)**

#### Step 1: Navigate to Your Folder

1. Click on the folder where you want to upload files
2. The main area shows the folder contents

#### Step 2: Upload Files

1. Click the **Upload** button in the ribbon
2. A dialog appears with options:
   - Click the upload area to browse files
   - Or drag and drop PDF files directly
3. For each file, you can:
   - **Rename** - Click the pencil icon to change the name
   - **Set Page Number** - Enter which page(s) to scan
     - Single page: `1`
     - Multiple pages: `1,3,5`
     - Range: `1-5`
     - Combined: `1-5,8,10-12`
     - Last page: `0`
4. Click **Upload & Scan** when ready
5. Wait for the upload and scan to complete

#### Step 3: Monitor Progress

- You'll see a progress bar for each file
- Scanning time varies based on file size
- Files show "Scanning..." status during processing
- When complete, status changes to "Scanned" or "Summary-Scanned"

**Tips:**
- Rename files before uploading for better organization
- Use summary scan (specific pages) for faster processing
- Upload multiple files at once to save time
- Larger files take longer to process

---

### Tutorial 3: Viewing and Editing Extracted Data

**Time: 3 minutes**

#### For Summary-Scanned Files

1. Find a file with "Summary-Scanned" status
2. Click the arrow icon next to the file name to expand
3. You'll see all extracted associations (BSM data)
4. Each row shows:
   - **Name** - Association name
   - **Total Area** - Land area value
   - **Usage** - Processing cost
   - **Confidence** - Accuracy percentage

#### Editing Data

**Edit Association Name:**
1. Click the pencil icon next to the name
2. Type the new name
3. Press Enter or click the checkmark

**Edit Area Value:**
1. Click the pencil icon next to the area
2. Enter the new value
3. Press Enter or click the checkmark

**Add New Association:**
1. Click the three-dot menu on the file
2. Select **Add Association**
3. A blank row appears
4. Fill in the name and area

**Delete Association:**
1. Click the trash icon next to the association
2. Confirm deletion in the popup
3. Association is removed

#### For Total-Scanned Files

1. Click the three-dot menu on the file
2. Select **View Summary**
3. A modal shows:
   - Total Area
   - Irrigated Area
   - Planted Area
   - Page-by-page data
   - Confidence scores

**Tips:**
- Check confidence scores - higher is better
- Verify extracted data against the original PDF
- Edit any incorrect values immediately
- Add associations if the scan missed any

---

### Tutorial 4: Moving Files and Folders

**Time: 2 minutes**

#### Moving a Single File

1. Click the three-dot menu on the file
2. Select **Move File**
3. A dialog shows your folder structure
4. Click on the destination folder
5. Click **Move**
6. File moves immediately

#### Moving Multiple Files

1. Click the **Select** button in the ribbon
2. Check the boxes next to files you want to move
3. Click the three-dot menu that appears
4. Select **Move Selected**
5. Choose destination folder
6. Click **Move**
7. All selected files move at once

#### Moving Folders

1. Right-click on the folder (or use three-dot menu)
2. Select **Move Folder**
3. Choose the new parent folder
4. Click **Move**
5. Folder and all its contents move

**Tips:**
- Plan your folder structure before moving many files
- Use bulk move for efficiency
- You can't move a folder into itself or its subfolders
- Moving folders also moves all files inside

---

### Tutorial 5: Generating Reports

**Time: 3 minutes**

#### Step 1: Select Files

1. Click the **Select** button in the ribbon
2. Check the boxes next to scanned files you want in the report
3. You can select files from different folders

#### Step 2: Configure Report

1. Click the three-dot menu
2. Select **Create Report**
3. A dialog appears with options:
   - **Title:** Report title (e.g., "Q1 2024 Irrigation Report")
   - **Season:** Wet or Dry season
   - **Year:** Report year
   - **Bold Keywords:** Words to make bold (comma-separated)
   - **Capitalize Keywords:** Words to capitalize (comma-separated)

#### Step 3: Generate

1. Click **Generate Report**
2. The system processes your data
3. An Excel file downloads automatically
4. Open the file to view your report

**Example Keywords:**
- Bold: `Total, Irrigated, Planted`
- Capitalize: `MALABON, LICUAN, BAGONG SILANG`

**Tips:**
- Only select scanned files (unscanned files won't have data)
- Use keywords to highlight important information
- Save report settings for future use
- Check the preview before generating large reports

---

### Tutorial 6: Adding Notes

**Time: 1 minute**

#### Add Note to Folder

1. Find the flag icon on the folder row
2. Click the flag icon
3. A popup appears
4. Type your note
5. Click **Save**
6. The flag turns orange to show a note exists

#### Add Note to File

1. Find the flag icon on the file row
2. Click the flag icon
3. Type your note
4. Click **Save**
5. Flag turns orange

#### Add Note to Association

1. Expand a summary-scanned file
2. Find the flag icon on the association row
3. Click and add your note
4. Click **Save**

#### View Existing Notes

1. Hover over an orange flag icon
2. The note appears in a tooltip
3. Click to edit or remove the note

**Tips:**
- Use notes for special instructions
- Mark files that need review
- Document unusual data or exceptions
- Notes are visible to all users

---

### Tutorial 7: Using Bulk Actions

**Time: 2 minutes**

#### Enable Select Mode

1. Click the **Select** button in the ribbon
2. Checkboxes appear next to all items
3. The button shows how many items are selected

#### Select Multiple Items

**Select Individual Items:**
- Click checkboxes one by one

**Select All in View:**
- Click the checkbox in the table header
- All visible items are selected

**Deselect:**
- Click checkboxes again to uncheck
- Or click **Select** button to exit select mode

#### Bulk Actions Available

1. **Create Report** - Generate report from all selected files
2. **Move Selected** - Move all selected files to another folder
3. **Delete Selected** - Remove all selected files

#### Perform Bulk Action

1. Select your items
2. Click the three-dot menu that appears
3. Choose your action
4. Confirm if prompted
5. Action applies to all selected items

**Tips:**
- Use bulk actions to save time
- Be careful with bulk delete - it can't be undone
- You can select files from multiple folders
- Exit select mode when done to avoid accidental selections

---

### Tutorial 8: Switching View Modes

**Time: 30 seconds**

#### Grid View

1. Click the grid icon (four squares) in the ribbon
2. Files appear as cards with:
   - Folder icon and color
   - File name
   - Status badge
   - Area information
   - Action buttons on hover

**Best for:**
- Visual browsing
- Identifying folders by color
- Quick overview of many files

#### Table View

1. Click the list icon (three lines) in the ribbon
2. Files appear in a detailed table with:
   - All file information in columns
   - Sortable headers
   - Expandable summary data
   - Inline editing

**Best for:**
- Detailed file information
- Comparing multiple files
- Editing data
- Working with associations

#### Your Preference is Saved

- The system remembers your choice
- Next time you log in, your preferred view loads automatically

**Tips:**
- Use grid view for organizing and browsing
- Use table view for data work and editing
- Switch views anytime based on your task

---

### Tutorial 9: Syncing Folder Totals

**Time: 1 minute**

#### Why Sync?

When you scan files or edit data, folder totals might not update automatically. Syncing recalculates all totals for a folder and its subfolders.

#### How to Sync

1. Find the folder you want to sync
2. Click the three-dot menu on the folder
3. Select **Sync Totals**
4. Wait a moment while it calculates
5. Folder totals update with current data

#### What Gets Updated

- Total Area (sum of all files in folder and subfolders)
- Irrigated Area
- Planted Area
- File counts

**When to Sync:**
- After scanning multiple files
- After editing area values
- When totals look incorrect
- Before generating reports

**Tips:**
- Sync parent folders to update entire branches
- Syncing is fast and safe
- You can sync as often as needed
- Totals include all subfolders

---

## Understanding Your Data

### File Status

**Unscanned**
- File uploaded but not processed
- No data extracted yet
- Shows gray badge
- Ready to scan

**Scanned**
- Entire document processed
- Total areas extracted
- Shows green badge
- Ready for reports

**Summary-Scanned**
- Specific pages processed
- Individual associations extracted
- Shows colored badge
- Can expand to see details

### Scan Types

**Total Scan**
- Processes all pages in the PDF
- Extracts overall totals from last page
- Best for complete documents
- Takes longer to process

**Summary Scan**
- Processes only specified pages
- Extracts individual associations (BSM data)
- Best for targeted data extraction
- Faster processing

### Data Fields

**Total Area**
- Sum of all land areas in the document
- Measured in hectares
- Main metric for reports

**Irrigated Area**
- Land with irrigation systems
- Subset of total area
- Important for water management

**Planted Area**
- Land currently planted with crops
- Subset of total area
- Indicates active cultivation

**Confidence Score**
- AI's certainty about extracted data
- Shown as percentage (0-100%)
- Higher is better
- Below 80% may need verification

**Usage**
- Cost of AI processing
- Shown in Philippine Pesos (₱)
- Based on document size and complexity
- Tracked for budgeting

### Associations

**What are Associations?**
- Individual entries extracted from summary scans
- Usually represent BSM (Barangay Service Multipurpose) organizations
- Each has its own name and area value

**Association Data:**
- **Name** - Organization or location identifier
- **Total Area** - Land area for this association
- **Confidence** - Accuracy score for this entry
- **Usage** - Processing cost for this entry
- **Notice** - Optional notes

---

## Tips for Best Results

### Document Preparation

**Before Uploading:**
- Ensure PDFs are clear and readable
- Check that tables are properly formatted
- Verify page numbers are correct
- Remove any password protection

**File Naming:**
- Use descriptive names
- Include dates or identifiers
- Keep names consistent
- Avoid special characters

### Scanning Strategy

**Choose the Right Scan Type:**
- Use **Total Scan** for complete documents with summary tables
- Use **Summary Scan** for documents with detailed association lists
- Scan specific pages to save time and cost

**Page Selection:**
- Know which pages contain your data
- Use page ranges for efficiency (e.g., `1-5` instead of `1,2,3,4,5`)
- Use `0` for the last page if you don't know the page count

### Data Verification

**After Scanning:**
- Check confidence scores (aim for 80% or higher)
- Verify extracted data against original PDF
- Edit any incorrect values immediately
- Add notes for unusual data

**Low Confidence?**
- Re-scan with different page selection
- Check PDF quality
- Manually verify and edit data
- Consider re-uploading a clearer PDF

### Organization

**Folder Structure:**
- Plan your hierarchy before uploading
- Use consistent naming conventions
- Group related documents together
- Don't create too many nested levels

**Regular Maintenance:**
- Delete old or duplicate files
- Update folder notes
- Sync folder totals regularly
- Archive completed projects

### Report Generation

**For Best Reports:**
- Scan all files before generating reports
- Use consistent naming across files
- Set up keyword formatting
- Preview before final generation
- Save templates for recurring reports

---

## Troubleshooting

### Login Issues

**Problem:** Can't log in

**Solutions:**
1. Check your email and password are correct
2. Ensure Caps Lock is off
3. Clear your browser cache and cookies
4. Try a different browser
5. Contact your administrator if still unable to login

---

### Upload Issues

**Problem:** Files won't upload

**Solutions:**
1. Check file is PDF format (not Word, Excel, etc.)
2. Verify file size is under 50MB
3. Check your internet connection
4. Try uploading fewer files at once
5. Refresh the page and try again

**Problem:** Upload is very slow

**Solutions:**
1. Check your internet speed
2. Upload smaller batches of files
3. Avoid uploading during peak hours
4. Close other browser tabs
5. Try a wired connection instead of WiFi

---

### Scanning Issues

**Problem:** Scan fails or returns no data

**Solutions:**
1. Check PDF quality - is it clear and readable?
2. Verify page numbers are correct
3. Try scanning specific pages instead of entire document
4. Check if PDF has any security restrictions
5. Re-upload the PDF and try again

**Problem:** Extracted data is incorrect

**Solutions:**
1. Check the confidence score (low score = less reliable)
2. Verify you scanned the correct pages
3. Look at the original PDF to confirm
4. Edit the incorrect values manually
5. Try re-scanning with different page selection

**Problem:** Scan is taking too long

**Solutions:**
1. Large files take longer (be patient)
2. Use summary scan instead of total scan
3. Scan specific pages only
4. Wait for current scans to finish before starting new ones
5. Check system status with administrator

**Problem:** Low confidence scores

**Solutions:**
1. Use higher quality PDF scans
2. Ensure tables are clearly formatted
3. Check for clear text (not handwritten)
4. Try scanning individual pages
5. Manually verify and edit the data

---

### Data Management Issues

**Problem:** Can't edit data

**Solutions:**
1. Click the pencil icon to enter edit mode
2. Ensure you have proper permissions
3. Check if file is currently being scanned
4. Refresh the page and try again
5. Contact administrator if issue persists

**Problem:** Folder totals are wrong

**Solutions:**
1. Click the folder's three-dot menu
2. Select "Sync Totals"
3. Wait for recalculation to complete
4. Check if all files are scanned
5. Verify individual file data is correct

**Problem:** Can't find a file

**Solutions:**
1. Check if you're in the correct folder
2. Use the search function (if available)
3. Check if file was moved or deleted
4. Look in parent or sibling folders
5. Ask other users if they moved it

---

### Report Issues

**Problem:** Report won't generate

**Solutions:**
1. Ensure all selected files are scanned
2. Check that files have data (not empty)
3. Try generating with fewer files
4. Verify report settings are correct
5. Refresh page and try again

**Problem:** Report has missing data

**Solutions:**
1. Check if all files were scanned successfully
2. Verify files have data before generating
3. Look for files with low confidence scores
4. Re-scan files with missing data
5. Generate report again

**Problem:** Report formatting is wrong

**Solutions:**
1. Check your keyword settings
2. Verify template is correct format
3. Try using default template
4. Re-upload custom template if using one
5. Contact administrator for template issues

---

### Performance Issues

**Problem:** System is slow

**Solutions:**
1. Wait for current scans to complete
2. Close other browser tabs
3. Clear browser cache
4. Refresh the page
5. Try during off-peak hours

**Problem:** Browser freezes

**Solutions:**
1. Close and reopen the browser
2. Clear browser cache and cookies
3. Update your browser to latest version
4. Try a different browser
5. Restart your computer

---

### General Issues

**Problem:** Changes aren't saving

**Solutions:**
1. Check your internet connection
2. Wait a moment and try again
3. Refresh the page (you may lose unsaved changes)
4. Log out and log back in
5. Contact administrator if persists

**Problem:** Can't see certain features

**Solutions:**
1. Check your user role and permissions
2. Refresh the page
3. Clear browser cache
4. Try a different browser
5. Contact administrator about permissions

**Problem:** Error messages appear

**Solutions:**
1. Read the error message carefully
2. Try the suggested action
3. Refresh the page
4. Log out and log back in
5. Contact administrator with error details

---

## Getting Help

### Before Contacting Support

1. Check this guide for solutions
2. Try the troubleshooting steps
3. Note any error messages
4. Try refreshing or restarting
5. Check with other users

### When Contacting Support

**Provide this information:**
- Your name and email
- What you were trying to do
- What happened instead
- Any error messages
- Browser and device you're using
- Steps to reproduce the problem

### Contact Information

Reach out to your system administrator or IT support team for:
- Login credential issues
- Permission problems
- Technical errors
- Feature requests
- Training needs

---

## Best Practices Summary

### Daily Use

- Log out when finished
- Scan files as soon as you upload them
- Verify extracted data regularly
- Add notes for important information
- Keep folders organized

### Weekly Maintenance

- Review and organize new files
- Delete unnecessary files
- Sync folder totals
- Check for files needing attention
- Generate regular reports

### Monthly Review

- Archive old projects
- Reorganize folder structure if needed
- Review usage and costs
- Update templates if needed
- Train new users

---

**System Version:** 1.0  
**Last Updated:** February 2026  
**For:** National Irrigation Administration

---

## Quick Reference

### Common Actions

| Action | Steps |
|--------|-------|
| Upload File | Click Upload → Select PDF → Configure → Upload & Scan |
| Scan File | Select file → Click Scan → Choose type → Start |
| Move File | Three-dot menu → Move File → Select folder → Move |
| Edit Data | Click pencil icon → Enter new value → Press Enter |
| Generate Report | Select files → Three-dot menu → Create Report → Configure → Generate |
| Add Note | Click flag icon → Type note → Save |
| Sync Folder | Three-dot menu → Sync Totals |

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Enter | Save edit |
| Escape | Cancel edit |
| Click checkbox | Select item |
| Double-click folder | Open folder |

### Status Colors

| Color | Meaning |
|-------|---------|
| Gray | Unscanned |
| Green | Scanned (Total) |
| Colored | Summary-Scanned |
| Orange | Has notice |
| Red | Error or warning |

---

**Need more help?** Contact your system administrator.
