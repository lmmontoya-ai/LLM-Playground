# Model Selector Architecture

## Component Hierarchy

```
ModelSelector (Main Container)
│
├── ModelSelectorTrigger (Button)
│   └── Renders different variants:
│       ├── Inline variant (with icon)
│       └── Default variant (with status dot)
│
└── ModelDropdown (Popup)
    │
    ├── Header Section
    │   ├── ModelSearchBar (Search input)
    │   ├── ModelFilterToggle (Loaded filter)
    │   └── Results summary text
    │
    └── List Section
        ├── ModelListItem (for each model)
        │   ├── Model name/ID
        │   ├── Status badge (if loaded)
        │   ├── Description
        │   ├── Tags
        │   └── Selection checkmark
        │
        └── Empty state message
```

## Data Flow

```
                    ┌─────────────────────┐
                    │   App Component     │
                    │  (models, provider) │
                    └──────────┬──────────┘
                               │ props
                               ▼
                    ┌─────────────────────┐
                    │   ModelSelector     │
                    │  - Composition root │
                    └──────────┬──────────┘
                               │
                    ┌──────────┴──────────┐
                    │  useModelSelector   │
                    │  - State management │
                    │  - Business logic   │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
    ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
    │   Search    │  │   Filter    │  │   Select    │
    │   Logic     │  │   Logic     │  │   Logic     │
    └──────┬──────┘  └──────┬──────┘  └──────┬──────┘
           │                │                │
           └────────────────┼────────────────┘
                            │
                    ┌───────▼────────┐
                    │ Utils Functions │
                    │ - Search models │
                    │ - Filter models │
                    │ - Highlight text│
                    └────────────────┘
```

## State Management

```
useModelSelector Hook
│
├── Local State
│   ├── isOpen: boolean          (dropdown visibility)
│   ├── searchQuery: string      (search input value)
│   ├── showLoadedOnly: boolean  (filter state)
│   └── focusedIndex: number     (keyboard navigation)
│
├── Refs
│   ├── containerRef             (click outside detection)
│   └── searchInputRef           (focus management)
│
├── Derived State (memoized)
│   ├── selectedModelMeta        (selected model object)
│   ├── loadedCount              (count of loaded models)
│   ├── hasLoadedModels          (has any loaded models)
│   └── filteredModels           (filtered & searched models)
│
└── Actions
    ├── open()                   (open dropdown)
    ├── close()                  (close dropdown)
    ├── toggle()                 (toggle dropdown)
    ├── setSearchQuery()         (update search)
    ├── toggleLoadedFilter()     (toggle filter)
    └── handleModelSelect()      (select model)
```

## Event Flow

### Opening Dropdown

```
User clicks trigger
       │
       ▼
toggle() called
       │
       ▼
isOpen = true
       │
       ▼
useEffect triggers
       │
       ▼
Focus search input
       │
       ▼
Render dropdown
```

### Searching Models

```
User types in search
       │
       ▼
setSearchQuery(value)
       │
       ▼
filteredModels recalculates
       │
       ├─► filterModelsByLoadedState()
       │
       ├─► searchModels()
       │   └─► computeModelMatchScore()
       │
       └─► ensureSelectedModelPresent()
       │
       ▼
Re-render list with filtered models
```

### Selecting Model

```
User clicks model
       │
       ▼
handleModelSelect(modelId)
       │
       ├─► onModelChange(modelId)  (prop callback)
       │
       ├─► setIsOpen(false)        (close dropdown)
       │
       └─► setSearchQuery("")      (clear search)
       │
       ▼
Parent component updates
       │
       ▼
Re-render with new selection
```

## Utility Functions Flow

```
Raw Models Array
       │
       ▼
filterModelsByLoadedState()
       │  (if showLoadedOnly = true)
       ▼
Filtered by loaded state
       │
       ▼
searchModels()
       │  (if searchQuery exists)
       ▼
   ┌───────────────────┐
   │ For each model:   │
   │ computeMatchScore │
   └────────┬──────────┘
            │
            ▼
   Sort by score (lower = better)
            │
            ▼
   Remove non-matches
            │
            ▼
ensureSelectedModelPresent()
       │  (add selected if missing)
       ▼
Final filtered models
```

## Keyboard Navigation Flow

```
User in search input
       │
       ▼
Presses Arrow Down
       │
       ▼
setFocusedIndex(0)
       │
       ▼
Visual focus on first item
       │
       ▼
User presses Arrow Down/Up
       │
       ▼
Update focusedIndex
       │
       ▼
User presses Enter
       │
       ▼
handleModelSelect(focusedModel)
```

## Type Safety Flow

```
types.ts
   │
   ├─► ModelSelectorProps
   │   └─► Used by ModelSelector.tsx
   │
   ├─► ModelListItemProps
   │   └─► Used by ModelListItem.tsx
   │
   ├─► UseModelSelectorReturn
   │   └─► Returned by useModelSelector hook
   │
   └─► All interfaces
       └─► Ensure type safety across all files
```

## Module Dependencies

```
ModelSelector.tsx
   │
   ├─► types.ts          (interfaces)
   ├─► hooks.ts          (useModelSelector)
   ├─► ModelSelectorTrigger.tsx
   └─► ModelDropdown.tsx
           │
           ├─► types.ts
           ├─► utils.ts  (formatModelCount, etc.)
           ├─► ModelSearchBar.tsx
           ├─► ModelFilterToggle.tsx
           └─► ModelListItem.tsx
                   │
                   ├─► types.ts
                   └─► utils.ts  (highlightMatches)

hooks.ts
   │
   └─► utils.ts  (all utility functions)

utils.ts
   │
   └─► types.ts  (SearchMatch, ModelInfo)
```

## Performance Optimizations

1. **Memoization**
   ```tsx
   const filteredModels = useMemo(() => {
     // Heavy computation only when dependencies change
   }, [models, searchQuery, showLoadedOnly, selectedModelId]);
   ```

2. **Event Listener Cleanup**
   ```tsx
   useEffect(() => {
     document.addEventListener('keydown', handler);
     return () => document.removeEventListener('keydown', handler);
   }, [deps]);
   ```

3. **Ref-based DOM Access**
   ```tsx
   // Avoid unnecessary re-renders
   const searchInputRef = useRef<HTMLInputElement>(null);
   searchInputRef.current?.focus();
   ```

4. **Callback Stability**
   ```tsx
   const handleSelect = useCallback((id) => {
     onModelChange(id);
   }, [onModelChange]);
   ```

## Accessibility Architecture

```
ModelSelector
   │
   ├─► ARIA Attributes
   │   ├─► aria-haspopup="listbox"
   │   ├─► aria-expanded={isOpen}
   │   └─► aria-label="Model selector"
   │
   ├─► Keyboard Handlers
   │   ├─► Escape (close)
   │   ├─► Arrow keys (navigate)
   │   ├─► Enter (select)
   │   ├─► Home (first)
   │   └─► End (last)
   │
   ├─► Focus Management
   │   ├─► Auto-focus search on open
   │   ├─► Visible focus indicators
   │   └─► Return focus on close
   │
   └─► Semantic HTML
       ├─► <button> for interactive elements
       ├─► role="listbox" for list
       └─► role="option" for items
```

## Testing Strategy

```
Unit Tests
   │
   ├─► utils.ts
   │   ├─► Test searchModels()
   │   ├─► Test filterModelsByLoadedState()
   │   ├─► Test computeMatchScore()
   │   └─► Test highlightMatches()
   │
   └─► Pure functions, easy to test

Integration Tests
   │
   ├─► hooks.ts
   │   ├─► Test useModelSelector state changes
   │   ├─► Test filtering logic
   │   └─► Test event handlers
   │
   └─► Use @testing-library/react-hooks

Component Tests
   │
   ├─► ModelSelector.tsx
   │   ├─► Test rendering variants
   │   ├─► Test user interactions
   │   └─► Test keyboard navigation
   │
   └─► Use @testing-library/react

E2E Tests
   │
   └─► Test complete user flows
       ├─► Open, search, select
       ├─► Filter, select
       └─► Keyboard navigation
```

This architecture provides:
- ✅ Clear separation of concerns
- ✅ Predictable data flow
- ✅ Easy to test and debug
- ✅ Type-safe interfaces
- ✅ Performance optimized
- ✅ Accessible by default
