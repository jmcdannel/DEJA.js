# Track Diagram Editor — Design Spec

## Context

The DEJA.js roadmap includes a "Track Diagram Editor" feature. Currently, the tam layout has hand-crafted SVG route maps (`payette-sub.svg`, `tamarack-junction.svg`) created in Affinity Designer and hard-coded as Vue components in the throttle app. These SVGs power interactive route selection -- users click origin/destination points to execute routes.

**Problem**: Creating these SVGs requires a graphics program and manual ID/group assignment. No other layout can have interactive route maps without this manual process.

**Goal**: Build a drag-and-drop track diagram editor in the cloud app that:
1. Lets users visually create track diagrams as node-based graphs
2. Generates structured SVGs compatible with the throttle app's interactive route system
3. Offers AI-powered image-to-SVG generation via Claude Vision API
4. Stores SVGs in Firebase Storage for use by both cloud and throttle apps

## Approach: Vue Flow + Template-Based SVG Generation

Use **Vue Flow** (Vue 3 native node-based editor) for the interactive canvas, combined with **pre-made SVG templates** extracted from existing tam SVGs for turnout/marker shapes. A live preview panel shows the actual SVG output in real-time.

### Why This Approach

- **Vue Flow** is Vue 3 native (`<script setup>` support), TypeScript-first, ~45KB gzipped
- **Template-based SVG generation** avoids computing turnout geometry from scratch -- templates come from the existing working SVGs
- **Live preview** closes the gap between editor and output, letting users see the actual SVG update in real-time
- Lowest risk: Vue Flow handles editor interaction, templates handle SVG rendering, only the assembly pipeline is novel code

### Alternatives Considered

1. **Custom SVG.js editor** -- WYSIWYG but requires building pan/zoom/drag-drop/undo from scratch (4-6 weeks)
2. **Pure Vue Flow + algorithmic SVG** -- cleanest architecture but turnout geometry math is complex and brittle (3-4 weeks)

## Architecture

### New Files

```
apps/cloud/src/TrackDiagram/
  TrackDiagram.vue                # Page shell -- list diagrams + create
  AddTrackDiagram.vue             # New diagram page
  EditTrackDiagram.vue            # Edit existing diagram
  TrackDiagramEditor.vue          # Main editor -- VueFlow canvas + toolbar + properties
  TrackDiagramPreview.vue         # Live SVG preview panel (split-pane)
  TrackDiagramToolbar.vue         # Tool palette (add station, turnout, junction, etc.)
  TrackDiagramProperties.vue      # Property panel for selected node/edge
  TrackDiagramAIImport.vue        # AI image upload + generation wizard
  nodes/
    StationNode.vue               # Custom VueFlow node -- route endpoint / station
    TurnoutNode.vue               # Custom VueFlow node -- turnout with rotation handle
    WaypointNode.vue              # Custom VueFlow node -- track routing waypoint
  edges/
    TrackEdge.vue                 # Custom VueFlow edge -- track segment
  composables/
    useTrackDiagram.ts            # Firestore CRUD for diagram documents
    useTrackDiagramSvg.ts         # Template-based SVG generation pipeline
    useTrackDiagramAI.ts          # Claude Vision API integration
    useTrackDiagramCss.ts         # CSS generation (extends gen-route-styles pattern)
  templates/                      # SVG fragment templates extracted from tam SVGs
    turnout-fork.svg              # Straight + divergent fork shape
    turnout-label.svg             # Circle + text label
    route-marker.svg              # Route endpoint marker
  types.ts                        # TypeScript interfaces
  constants.ts                    # Node type defs, default colors, grid settings
```

```
packages/modules/trackDiagrams/
  types.ts                        # Shared interfaces (TrackDiagram, TrackDiagramNode, etc.)
  useTrackDiagrams.ts             # Shared composable -- fetch diagram metadata + SVG URLs
  constants.ts                    # Node type definitions
  index.ts                        # Barrel export
```

### Modified Files

| File | Change |
|------|--------|
| `packages/firebase-config/src/firebase.ts` | Add `getStorage` export |
| `packages/modules/index.ts` | Export new `trackDiagrams` module |
| `apps/cloud/src/router.ts` | Add `/track-diagrams`, `/track-diagrams/new`, `/track-diagrams/:diagramId` routes |
| `apps/cloud/src/Core/useMenu.ts` | Add "Track Diagrams" menu item |
| `apps/throttle/src/routes/Routes.vue` | Load SVGs from Firebase Storage instead of hard-coded imports |
| `apps/throttle/src/routes/useLayoutRoutesMap.ts` | Support dynamically loaded SVGs (minimal changes) |

## Data Model

```typescript
// packages/modules/trackDiagrams/types.ts

export interface TrackDiagramNode {
  id: string
  type: 'station' | 'turnout' | 'waypoint'
  label: string
  position: { x: number; y: number }
  rotation: number                    // Degrees -- orientation of turnout forks
  data: {
    turnoutId?: string               // Links to Firestore turnout document
    routePointId?: string            // Maps to Route.point1 / point2
    trackLine?: string               // e.g., "Mainline", "Yard", "Storage"
    color?: string
  }
}

export interface TrackDiagramEdge {
  id: string
  source: string                     // Node ID
  target: string                     // Node ID
  sourceHandle?: string              // 'straight' | 'divergent' for turnout nodes
  targetHandle?: string
  data: {
    trackLine: string                // Which line group this edge belongs to
    color: string                    // Stroke color
    strokeWidth: number
    pathType: 'straight' | 'curve'
  }
}

export interface TrackDiagram {
  id: string
  name: string
  layoutId: string
  nodes: TrackDiagramNode[]
  edges: TrackDiagramEdge[]
  viewBox: { width: number; height: number }
  svgUrl?: string                    // Firebase Storage download URL
  cssUrl?: string                    // Firebase Storage download URL
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

**Firestore path**: `layouts/{layoutId}/trackDiagrams/{diagramId}`
**Storage paths**: `layouts/{layoutId}/maps/{diagramId}.svg`, `layouts/{layoutId}/maps/{diagramId}.css`

## SVG Output Contract

The generated SVG must match the structure consumed by `useLayoutRoutesMap.ts` in the throttle app. The composable traverses the DOM looking for these group IDs:

```xml
<svg viewBox="0 0 {width} {height}">
  <g id="Background">
    <rect x="0" y="0" width="{width}" height="{height}" />
  </g>
  <g id="Lines">
    <g id="{trackLineName}">
      <path d="..." style="stroke:{color}; stroke-width:{width}" />
    </g>
  </g>
  <g id="Turnouts">
    <g id="{turnoutId}">
      <g><!-- straight position paths --></g>
      <g><!-- divergent position paths --></g>
    </g>
  </g>
  <g id="TurnoutLabels">
    <g id="lbl{turnoutId}">
      <circle cx="..." cy="..." r="13" />
      <text>{labelText}</text>
    </g>
  </g>
  <g id="Routes">
    <g id="{routePointId}">
      <path d="..." />
      <text>{labelText}</text>
    </g>
  </g>
</svg>
```

## CSS Output Contract

Generated CSS must follow the pattern in `gen-route-styles.ts`:

```css
/* Base */
:root { --turnout-hover-fill: ...; --route-selected-fill: ...; --route-available-fill: ...; }
#TurnoutLabels > g, #Routes > g { cursor: pointer; }

/* Per turnout */
.{turnoutId}-straight #Turnouts #{turnoutId} > g:last-child { visibility: hidden; }
.{turnoutId}-straight #Turnouts #{turnoutId} > g:first-child path { stroke: black !important; }
.{turnoutId}-divergent #Turnouts #{turnoutId} > g:first-child { visibility: hidden; }
.{turnoutId}-divergent #Turnouts #{turnoutId} > g:last-child path { stroke: black !important; }

/* Per route point */
.selected-{POINT} #Routes > g#{POINT} path { fill: var(--route-selected-fill) !important; }
.available-{POINT} #Routes > g#{POINT} path { fill: var(--route-available-fill) !important; }
```

## SVG Generation Pipeline

`useTrackDiagramSvg.ts` converts the VueFlow graph into the structured SVG:

1. **Background**: `<g id="Background"><rect>` at viewBox dimensions
2. **Lines**: Group edges by `trackLine` -> `<g id="Lines"><g id="Mainline">...`. Compute `<path>` from source/target positions (bezier for curves, linear for straight)
3. **Turnouts**: Stamp `turnout-fork.svg` template at `(x, y)` with `rotation` -> `<g id="Turnouts"><g id="{turnoutId}"><g>straight</g><g>divergent</g></g>`
4. **TurnoutLabels**: Stamp `turnout-label.svg` template offset from turnout -> `<g id="TurnoutLabels"><g id="lbl{turnoutId}"><circle/><text/></g>`
5. **Routes**: Stamp `route-marker.svg` template at station nodes -> `<g id="Routes"><g id="{routePointId}"><path/><text/></g>`
6. **Assembly**: Wrap in `<svg>` root with viewBox and namespaces

## AI Image-to-SVG Integration

1. User uploads image (track plan, photo, hand-drawn sketch)
2. Image sent to server-side endpoint (Cloud Function or `apps/server` route)
3. Claude Vision API analyzes image with structured prompt
4. Returns `TrackDiagramNode[]` + `TrackDiagramEdge[]`
5. Loaded into VueFlow canvas for refinement
6. Three-step wizard: Adjust layout -> Link to Firebase data -> Preview + export

## Throttle App Integration

1. Check for `TrackDiagram` documents in Firestore for current layout
2. If found, fetch SVG from Firebase Storage URL and render inline
3. Fetch + inject CSS from Storage URL
4. `useLayoutRoutesMap` works unchanged (DOM traversal for `#Routes`, `#Turnouts`, `#TurnoutLabels`)
5. Fall back to hard-coded tam SVG components if no diagrams exist

## Dependencies

| Package | Purpose | Install to |
|---------|---------|-----------|
| `@vue-flow/core` | Node graph editor | `apps/cloud` |
| `@vue-flow/background` | Grid background | `apps/cloud` |
| `@vue-flow/controls` | Zoom/pan UI controls | `apps/cloud` |
| `@vue-flow/minimap` | Overview minimap | `apps/cloud` |
| `@anthropic-ai/sdk` | Claude Vision (server) | `apps/server` |

## Implementation Phases

### Phase 1: Core Editor (MVP)
- Firebase Storage setup
- `@repo/modules/trackDiagrams` module
- Cloud app editor (VueFlow + custom nodes + toolbar + properties)
- SVG generation pipeline + CSS generation
- Firebase Storage upload/download
- Firestore persistence
- Live preview panel
- Cloud app routes + menu

### Phase 2: Throttle App Integration
- Dynamic SVG loading from Firebase Storage
- CSS injection
- Backward-compatible fallback

### Phase 3: AI Image Import
- Server-side AI endpoint
- AI import wizard component
- Claude Vision prompt engineering
- Response parsing into graph data
