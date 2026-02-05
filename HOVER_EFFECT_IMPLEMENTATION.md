# Table Row Hover Effect Implementation

## Overview
Added gradient hover effects to all table rows in the FileList component that use the parent folder's color.

## Implementation Details

### Color System
- Each folder has a color property (red, orange, yellow, emerald, blue, indigo, purple, pink)
- Files inherit their parent folder's color for visual consistency

### Gradient Effect
- **Direction**: Left to right gradient (`bg-gradient-to-l`)
- **Left side**: Transparent (`to-transparent`)
- **Right side**: Semi-transparent folder color (`from-{color}-500/40`)
- **Opacity**: 40% opacity for more visible effect

### Applied To
1. **Folder table rows**: Uses folder's own color
2. **Summary scanned files**: Uses parent folder color
3. **Regular PDF files**: Uses parent folder color
4. **Sub-rows**: Expanded summary associations also get the effect

### Technical Implementation
```typescript
const GRADIENT_HOVER_MAP: Record<string, string> = {
  red: 'hover:bg-gradient-to-l hover:from-red-500/20 hover:to-transparent',
  orange: 'hover:bg-gradient-to-l hover:from-orange-500/20 hover:to-transparent',
  // ... other colors
};
```

### Usage
Each table row now uses the gradient hover class based on the folder color:
```typescript
className={`transition ${GRADIENT_HOVER_MAP[folderColor] || 'hover:bg-gradient-to-l hover:from-blue-500/20 hover:to-transparent'}`}
```

## Visual Result
- Hovering over any table row creates a subtle gradient tint
- The tint color matches the parent folder's theme color
- Creates visual hierarchy and improved user experience
- Maintains accessibility with sufficient contrast