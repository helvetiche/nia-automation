# Report Formatting Rules

## Text Transformations

### 1. Keyword Matching (Word Boundaries)

Keywords are now matched as whole words only, not partial character matches.

**Example:**
- Keyword: "IA"
- Input: "Association IA"
- Output: "Association IA" ✓
- Input: "Association"
- Output: "Association" ✓ (no false match on "assocIAtion")

**Implementation:**
Uses `\b` word boundary regex to match complete words only.

### 2. Hyphen Handling

Hyphens are preserved while capitalizing words on both sides.

**Examples:**
- "hinukay-hawaii" → "Hinukay-Hawaii"
- "upper-lower-case" → "Upper-Lower-Case"
- "non-ia" → "NON-IA" (exception rule applies)

**Implementation:**
Splits on spaces and hyphens while preserving the separators, then capitalizes each word part.

### 3. Parentheses Auto-Bold

Any text enclosed in parentheses is automatically bolded.

**Examples:**
- "Farmers Association (Main)" → "Farmers Association **(Main)**"
- "IA (Active)" → "IA **(Active)**"
- "Group (2024-2025)" → "Group **(2024-2025)**"

**Implementation:**
Uses ExcelJS rich text formatting to apply bold font to parenthetical content.

## Capitalization Exceptions

The following patterns are always fully uppercased:
- "NON-IA"
- "NON - IA"
- "NON IA"
- "NONIA"

## Usage in API

When generating reports, you can pass keywords to uppercase:

```
GET /api/reports/lipa?folderId=xxx&boldKeywords=IA,NIA&capitalizeKeywords=MAIN
```

**Parameters:**
- `boldKeywords` - Comma-separated list of words to uppercase
- `capitalizeKeywords` - Comma-separated list of words to uppercase

Both parameters use word boundary matching to avoid partial matches.

## Technical Details

**Word Boundary Regex:**
```typescript
const regex = new RegExp(`\\b${keyword}\\b`, "gi");
```

**Hyphen Replacement:**
```typescript
.split(/(\s+|-)/g)
.map(part => part === '-' || part.trim() === '' ? part : capitalize(part))
.join('')
```

**Parentheses Detection:**
```typescript
const parts = text.split(/(\([^)]+\))/g);
```

## Examples

### Input
```
hinukay-hawaii irrigators association (main branch)
```

### Processing Steps
1. Hyphen preservation: "hinukay-hawaii irrigators association (main branch)"
2. Capitalization: "Hinukay-Hawaii Irrigators Association (main branch)"
3. Keyword matching (if "IA" in keywords): "Hinukay-Hawaii Irrigators Association (main branch)"
4. Parentheses bolding: "Hinukay-Hawaii Irrigators Association **(main branch)**"

### Output
```
Hinukay-Hawaii Irrigators Association (main branch)
                                       ^^^^^^^^^^^^
                                       (bolded in Excel)
```
