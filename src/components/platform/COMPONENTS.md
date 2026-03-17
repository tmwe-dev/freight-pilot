# Platform Components Reference

All platform components are located in `/src/components/platform/` and can be imported from the index:

```tsx
import {
  MasterPageShell,
  CarouselEngine,
  AICompanion,
  GlassCard,
  StepIndicator,
  GlobalFilters,
  ListDetailView,
  WowBackground,
} from "@/components/platform";
```

## Component Overview

### 1. **MasterPageShell.tsx** (119 lines)
The main shell wrapper for the 5 master pages (RADAR, NETWORK, COCKPIT, LAUNCH, CONTROL).

**Features:**
- Full-screen dark layout with glassmorphism
- Top navigation bar with 5 master page tabs
- Active page indicator with animated underline
- Smooth page transitions using AnimatePresence
- Icons: Radar, Globe, Rocket, Send, BarChart3
- WOW floating particles background
- Slot for AICompanion on right side

**Props:**
```tsx
interface MasterPageShellProps {
  activePage: string;
  children: ReactNode;
  onPageChange: (page: string) => void;
  aiCompanion?: ReactNode;
}
```

---

### 2. **CarouselEngine.tsx** (170 lines)
Horizontal carousel/canvas navigation system for multi-panel layouts.

**Features:**
- Horizontal swipe with touch/trackpad support
- Smooth spring animations between panels
- Step indicator dots at bottom
- Edge glow effects for first/last panels
- Keyboard navigation (arrow keys)
- Parallax effect on adjacent panels
- Full-width canvas panels

**Props:**
```tsx
interface CarouselEngineProps {
  children: ReactNode[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  labels?: string[];
}
```

---

### 3. **AICompanion.tsx** (258 lines)
Context-aware AI assistant sidebar.

**Features:**
- Collapsible panel (320px expanded, 48px collapsed)
- Toggle button with pulsing sparkle icon
- Chat-like interface with message bubbles
- Context indicator at top
- Quick action buttons (context-aware)
- Typing animation for AI responses
- Glass panel consistent with design system
- Mock AI responses (ready for API connection)

**Props:**
```tsx
interface AICompanionProps {
  context: string;
  quickActions?: QuickAction[];
}

interface QuickAction {
  label: string;
  icon: any;
  action: () => void;
}
```

---

### 4. **GlassCard.tsx** (90 lines)
Reusable glassmorphism card component for the design system.

**Features:**
- bg-white/[0.03] backdrop-blur-xl styling
- Thin ultra-white borders (border-white/[0.06])
- Hover effects with glow
- Optional scale animation on hover
- 3 variants: default, interactive, highlighted
- Customizable glow colors (white, blue, purple, green, red)
- Shimmer effect for interactive cards

**Props:**
```tsx
interface GlassCardProps {
  children: ReactNode;
  variant?: "default" | "interactive" | "highlighted";
  className?: string;
  onClick?: () => void;
  glowColor?: "white" | "blue" | "purple" | "green" | "red";
}
```

---

### 5. **StepIndicator.tsx** (91 lines)
Visual step/progress indicator for carousel sequences.

**Features:**
- Row of animated dots/pills
- Active dot is wider (pill shape) with gradient
- Optional labels below dots
- Animated transitions between steps
- Counter display (current / total)
- Customizable colors
- Compact and elegant design

**Props:**
```tsx
interface StepIndicatorProps {
  steps: number;
  current: number;
  labels?: string[];
  color?: string;
}
```

---

### 6. **GlobalFilters.tsx** (280 lines)
Universal filter and sort bar component.

**Features:**
- Horizontal scrollable filter chips
- 4 filter types: text search, select dropdown, date range, toggle
- Sort dropdown with options
- Animated chip add/remove
- Clear all button with count
- Glass-style design consistent with system
- Compact and elegant layout

**Props:**
```tsx
interface GlobalFiltersProps {
  filters: FilterConfig[];
  activeFilters: Record<string, any>;
  onFilterChange: (filterId: string, value: any) => void;
  sortOptions?: SortOption[];
  activeSort?: string;
  onSortChange?: (sortId: string) => void;
}

interface FilterConfig {
  id: string;
  type: "text" | "select" | "dateRange" | "toggle";
  label: string;
  placeholder?: string;
  options?: Array<{ label: string; value: string }>;
}

interface SortOption {
  id: string;
  label: string;
}
```

---

### 7. **ListDetailView.tsx** (127 lines)
Universal list-to-detail pattern component.

**Features:**
- Left side: scrollable list with items
- Right side: detail panel slides in on selection
- Mobile responsive (full-screen detail with back button)
- List items with hover and selected states
- Detail panel in glass card styling
- Smooth spring animations
- AnimatePresence for transitions

**Props:**
```tsx
interface ListDetailViewProps<T> {
  items: T[];
  renderItem: (item: T, isActive: boolean) => ReactNode;
  renderDetail: (item: T) => ReactNode;
  selectedId?: string | null;
  onSelect: (id: string) => void;
  itemKeyExtractor?: (item: T) => string;
}
```

---

### 8. **WowBackground.tsx** (200 lines)
Animated background with floating particles for premium WOW effect.

**Features:**
- Floating dots/particles with CSS animations (no canvas - lightweight)
- Multiple layers with different speeds (parallax)
- Pulsing gradient orbs
- Performance optimized (will-change, GPU accelerated)
- 6 variants: default, radar, network, cockpit, launch, control
- 3 intensity levels: low, medium, high
- Animated grid overlay
- Radial gradient for depth

**Props:**
```tsx
interface WowBackgroundProps {
  variant?: "default" | "radar" | "network" | "cockpit" | "launch" | "control";
  intensity?: "low" | "medium" | "high";
}
```

---

## Design System

All components follow the established design system:
- **Dark theme**: Black backgrounds with white/transparent overlays
- **Glass effect**: Consistent use of backdrop-blur and ultra-thin borders (white/[0.06])
- **Animations**: Smooth framer-motion transitions and spring physics
- **Icons**: lucide-react for all iconography
- **Utilities**: @/lib/utils (cn function) for class composition
- **Typography**: System fonts with careful color hierarchy

## Usage Example

```tsx
import { MasterPageShell, AICompanion, WowBackground } from "@/components/platform";

export default function App() {
  const [activePage, setActivePage] = useState("RADAR");

  return (
    <MasterPageShell
      activePage={activePage}
      onPageChange={setActivePage}
      aiCompanion={<AICompanion context="RADAR" />}
    >
      {/* Your page content here */}
    </MasterPageShell>
  );
}
```

## Installation Notes

All dependencies are already installed in the project:
- ✓ react 18
- ✓ typescript
- ✓ tailwind css
- ✓ framer-motion
- ✓ lucide-react
- ✓ shadcn/ui

No additional packages need to be installed.
