# UI Component Guidelines

## Import Convention
All UI components must be imported from `@/components/ui/*`

```tsx
// ✅ Correct
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

// ❌ Wrong - Don't use app/components/ui
import { Dialog } from '@/app/components/ui/dialog'
```

## Component Location
- All shared UI components live in `/components/ui/`
- No duplicates allowed in `/app/components/ui/`
- Use TypeScript paths for consistent imports
- Path aliases automatically redirect old imports

## Modal/Dialog Guidelines

### Default Widths
- Default: `sm:max-w-container-narrow` (768px) - Good for most modals
- For wider modals: Add `className="sm:max-w-container-wide"` (1280px)
- For narrow modals: Add `className="sm:max-w-md"` (28rem/448px)
- For mobile-first: Use `max-w-[90vw] sm:max-w-*` pattern

### Example Usage
```tsx
// Standard modal (768px on desktop)
<DialogContent>
  {/* Content */}
</DialogContent>

// Wide modal for data tables
<DialogContent className="sm:max-w-container-wide">
  {/* Wide content */}
</DialogContent>

// Narrow modal for simple forms
<DialogContent className="sm:max-w-md">
  {/* Compact content */}
</DialogContent>
```

## Component Architecture
- All dialogs now use `flex flex-col` layout (no more grid issues)
- Responsive by default with mobile-first approach
- Close button included unless `showCloseButton={false}`
- Animations and transitions preserved from Radix UI

## Enforcement
- ESLint configured to prevent imports from `/app/components/ui`
- TypeScript paths redirect imports automatically
- Pre-commit hooks check for duplicate components

## Migration Notes
If you find any components still importing from the old location:
1. Update the import to use `@/components/ui/*`
2. Remove any CSS workarounds like `!block` or `!flex`
3. Test that the component displays correctly
4. Remove any duplicate files in `/app/components/ui/`