# Model Selector Component

A complete redesign of the model selector with better architecture, maintainability, and accessibility.

## 📐 Architecture

### Previous Issues
- **Monolithic component** (600+ lines) - difficult to test and maintain
- **Mixed concerns** - UI rendering, search logic, and state management in one file
- **Complex state** - multiple useState hooks managing related data
- **Poor separation** - utility functions mixed with components
- **Unclear naming** - inconsistent component naming

### New Architecture

The redesign follows these principles:

1. **Separation of Concerns**
   - UI components separate from business logic
   - Pure utility functions for data transformations
   - Custom hooks for state management

2. **Modular Design**
   - Small, focused components with single responsibilities
   - Composable architecture
   - Reusable building blocks

3. **Type Safety**
   - Centralized type definitions
   - Clear interfaces for all components
   - Better IDE autocomplete and error detection

4. **Accessibility**
   - Keyboard navigation (Arrow keys, Home, End, Enter, Escape)
   - ARIA labels and roles
   - Focus management

## 📁 File Structure

```
model-selector/
├── index.ts                      # Exports all public APIs
├── types.ts                      # TypeScript type definitions
├── utils.ts                      # Pure utility functions
├── hooks.ts                      # Custom React hooks
├── ModelSelector.tsx             # Main component (composition)
├── ModelSelectorTrigger.tsx      # Button trigger component
├── ModelDropdown.tsx             # Dropdown container
├── ModelListItem.tsx             # Individual model item
├── ModelSearchBar.tsx            # Search input component
├── ModelFilterToggle.tsx         # Filter toggle button
├── ModelDetailsCard.tsx          # Model details display
└── README.md                     # This file
```

## 🧩 Components

### ModelSelector (Main Component)

The primary component that composes all sub-components.

```tsx
import { ModelSelector } from "@/components/model-selector";

<ModelSelector
  models={models}
  selectedModel={selectedModelId}
  onModelChange={(id) => setSelectedModelId(id)}
  provider={provider}
  variant="inline"  // or "default"
  align="start"     // or "center"
  showLoadedToggle={true}
/>
```

**Props:**
- `models`: Array of available models
- `selectedModel`: Currently selected model ID
- `onModelChange`: Callback when selection changes
- `provider`: Provider metadata (optional)
- `variant`: Visual style - "default" or "inline"
- `align`: Dropdown alignment - "start" or "center"
- `showLoadedToggle`: Show filter for loaded models
- `totalModels`: Override total count (optional)

### ModelDetailsCard

Displays comprehensive model information.

```tsx
import { ModelDetailsCard } from "@/components/model-selector";

<ModelDetailsCard
  model={selectedModel}
  provider={provider}
  totalModels={models.length}
/>
```

## 🎨 Design Improvements

### 1. Visual Hierarchy
- Clear information structure
- Consistent spacing and typography
- Better use of color for status indicators

### 2. Responsive Design
- Works on mobile and desktop
- Adaptive layouts
- Touch-friendly hit areas

### 3. Status Indicators
- Visual cues for loaded models
- Provider information clearly displayed
- Model counts and filters

## ♿ Accessibility

### Keyboard Navigation
- **Escape**: Close dropdown
- **Arrow Down**: Navigate to next model
- **Arrow Up**: Navigate to previous model
- **Enter**: Select focused model
- **Home**: Jump to first model
- **End**: Jump to last model

### Screen Readers
- Proper ARIA labels
- Role attributes
- Semantic HTML structure

### Focus Management
- Auto-focus on search input when opening
- Visible focus indicators
- Logical tab order

## 🔧 Utilities

### Search and Filtering

```ts
import { searchModels, filterModelsByLoadedState } from "@/components/model-selector";

const filtered = filterModelsByLoadedState(models, showLoadedOnly);
const searched = searchModels(filtered, searchQuery);
```

### Text Highlighting

```ts
import { highlightMatches } from "@/components/model-selector";

const highlighted = highlightMatches("model name", searchQuery);
```

### Model Utilities

```ts
import {
  getModelDisplayLabel,
  getProviderDisplayLabel,
  countLoadedModels
} from "@/components/model-selector";
```

## 🪝 Custom Hooks

### useModelSelector

Main hook managing all selector state:

```ts
import { useModelSelector } from "@/components/model-selector";

const {
  isOpen,
  toggle,
  searchQuery,
  setSearchQuery,
  filteredModels,
  handleModelSelect,
  // ... more
} = useModelSelector(models, selectedModelId, onModelChange);
```

## 🧪 Testing

The modular architecture makes testing easier:

- **Pure functions** (utils.ts) can be tested independently
- **Custom hooks** can be tested with React Testing Library
- **Components** can be tested in isolation with mock data

## 🔄 Migration Guide

### From Old ModelSelector

```tsx
// Before
import { ModelSwitcher } from "@/components/settings/ModelSelector";

<ModelSwitcher
  models={models}
  selectedModel={selectedModel}
  onModelChange={onModelChange}
  provider={provider}
  variant="inline"
/>

// After
import { ModelSelector } from "@/components/model-selector";

<ModelSelector
  models={models}
  selectedModel={selectedModel}
  onModelChange={onModelChange}
  provider={provider}
  variant="inline"
/>
```

### From Old ModelDetailsCard

```tsx
// Before
import { ModelDetailsCard } from "@/components/settings/ModelSelector";

// After
import { ModelDetailsCard } from "@/components/model-selector";

// API remains the same
```

## 🎯 Benefits

1. **Maintainability**: Smaller files, clear responsibilities
2. **Testability**: Pure functions, isolated components
3. **Reusability**: Atomic components can be used elsewhere
4. **Scalability**: Easy to add new features or variants
5. **Type Safety**: Comprehensive TypeScript coverage
6. **Accessibility**: Full keyboard and screen reader support
7. **Performance**: Memoized computations, efficient re-renders

## 📝 Notes

- The component handles a `name` property on models that's not in the type definition but may be present at runtime
- Search scoring prioritizes direct matches over fuzzy matches
- The selected model is always included in filtered results
- Focus management ensures good keyboard UX

## 🚀 Future Enhancements

Potential improvements:
- Virtual scrolling for large model lists
- Grouped models by provider/category
- Recent selections memory
- Custom model badges
- Export/import selection preferences
- Model comparison mode
