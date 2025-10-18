# Layout Module Architecture

## Component Hierarchy

```
NavigationSidebar (Composition root)
│
├── NavigationSidebarView (static sidebar UI)
└── NavigationSettingsModal (portal modal)
     └── Uses Input/Button primitives

DeveloperPanel (Composition root)
│
└── DeveloperPanelView
    ├── ModelDetailsCard
    ├── SettingsPanel
    └── HuggingFaceDownloadsPanel (section-specific)
```

## Data Flow

```
App.tsx (layout props, API key state, provider/model data)
            │
            ▼
NavigationSidebar / DeveloperPanel
            │
            ▼
useNavigationSidebar / useDeveloperPanel hooks
            │
            ├─► Derived status metadata (labels, colors)
            ├─► Modal + toggle state
            └─► Provider/model lookups
```

## State Management

### useNavigationSidebar

```
Local State
  - isSettingsOpen          (modal visibility)
  - isSavingKey             (save mutation status)
  - isClearingKey           (clear mutation status)
  - feedback                (success/error messaging)

Refs
  - inputRef                (focus management)

Derived State
  - statusLabel / statusColor / isRuntimeKey (from ApiKeySource)
  - navItems (static config)

Actions
  - openSettings / closeSettings
  - handleSaveApiKey (persists key via API)
  - handleClearStoredApiKey (removes stored key)
```

### useDeveloperPanel

```
Derived State
  - isRightAligned (from align prop)
  - title / subtitle (section metadata)
  - openIcon / closeIcon (dynamic icon selection)
  - providerMeta / selectedModelMeta (lookup from arrays)
```

## Event Flow

### Opening Settings Modal

```
User clicks Settings button
       │
       ▼
openSettings()
       │
       ▼
isSettingsOpen = true
       │
       ├─► useEffect attaches Escape listener
       ├─► Focus inputRef on next tick
       └─► Feedback initialised based on apiKeySource
```

### Saving API Key

```
Submit modal form
       │
       ▼
handleSaveApiKey()
       │
       ├─► Validates trimmed key
       ├─► Calls onApiKeyPersist()
       └─► Sets success/error feedback
```

### Clearing Runtime Key

```
Remove stored key
       │
       ▼
handleClearStoredApiKey()
       │
       ├─► Calls onApiKeyClear()
       └─► Updates feedback with result context
```

## Accessibility Notes

- Modal uses `aria-modal`, traps backdrop clicks, and closes on Escape.
- Buttons remain semantic `<button>` elements with descriptive titles.
- Icons include focusable buttons only (no div handlers).
- Sidebar navigation uses `<button>` elements for keyboard reachability.

## Module Dependencies

```
NavigationSidebar.tsx
 ├─► hooks.ts (useNavigationSidebar)
 ├─► NavigationSidebarView.tsx
 └─► NavigationSettingsModal.tsx

DeveloperPanel.tsx
 ├─► hooks.ts (useDeveloperPanel)
 └─► DeveloperPanelView.tsx

hooks.ts
 └─► utils.ts (nav items, section metadata, status helpers)
```

## Testing Strategy

- **Unit**: `utils.ts` helpers (`getApiKeyStatusMeta`) and nav item exports.
- **Hook**: `useNavigationSidebar` (modal toggling, feedback handling, mutation flows) and `useDeveloperPanel` (provider/model lookup).
- **Component**: Verify NavigationSidebar renders correct active state, exposes settings modal actions, and DeveloperPanel presents provider/model metadata based on props.
