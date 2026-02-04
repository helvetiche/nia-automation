# Firestore Indexes Required

For optimal performance with heavy read operations, create these composite indexes in Firebase Console.

## How to Create Indexes

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: `nia-automation`
3. Click "Firestore Database"
4. Click "Indexes" tab
5. Click "Create Index"

## Required Composite Indexes

### 1. Folders Collection
```
Collection: folders
Fields:
  - userId (Ascending)
  - createdAt (Ascending)
```

### 2. PDFs Collection (Root Files)
```
Collection: pdfs
Fields:
  - userId (Ascending)
  - folderId (Ascending)
  - uploadedAt (Descending)
```

### 3. Pages Collection
```
Collection: pages
Fields:
  - pdfId (Ascending)
  - pageNumber (Ascending)
```

## Single Field Indexes (Auto-created)

These are automatically created by Firestore:
- `folders.userId`
- `folders.createdAt`
- `pdfs.userId`
- `pdfs.folderId`
- `pdfs.uploadedAt`
- `pages.pdfId`
- `pages.pageNumber`

## Performance Notes

- Indexes enable fast queries even with millions of documents
- Composite indexes are required for queries with multiple where clauses + orderBy
- Indexes are automatically maintained by Firestore
- No performance degradation as data grows

## Monitoring

Check index usage in Firebase Console:
- Firestore → Usage tab
- Monitor read/write operations
- Check for missing indexes warnings
