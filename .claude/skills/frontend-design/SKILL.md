---
name: frontend-design
description: Frontend design system and UI/UX guidelines for a financial long-term planning app. Use when building UI components, styling, layouts, dashboards, or any visual elements.
---

# Frontend Design Skill — FinancialLongTerm

## Stack assumptions
- React + TypeScript (default unless told otherwise)
- Tailwind CSS for styling
- Recharts or Chart.js for financial data visualization
- Lucide React for icons

## Design principles
- **Mobile-first**: design base styles for mobile (320px+), then enhance with `sm:`, `md:`, `lg:` breakpoints — never the reverse
- **Trust and clarity first**: financial data must be readable at a glance — no ambiguity in numbers or trends
- **Conservative palette**: avoid flashy colors; use muted tones with purposeful accent colors
- **Density control**: show enough data without overwhelming; use progressive disclosure (summary → detail)
- **Accessibility**: WCAG AA minimum — sufficient contrast ratios, keyboard navigable, screen-reader labels on all charts

## Color tokens
```
Primary:      #1E3A5F  (deep navy — trust, stability)
Accent:       #2E86AB  (steel blue — interactive elements)
Success/Gain: #2D6A4F  (dark green — positive returns)
Danger/Loss:  #C1121F  (dark red — losses, alerts)
Warning:      #E9C46A  (amber — caution states)
Background:   #F8F9FA  (off-white)
Surface:      #FFFFFF  (cards, panels)
Border:       #DEE2E6
Text primary: #212529
Text muted:   #6C757D
```

## Typography
- Font: Inter or system-ui
- Headings: font-semibold, tracking-tight
- Numbers/amounts: font-mono (tabular figures for alignment)
- Large KPI numbers: text-3xl font-bold
- Labels: text-sm text-muted uppercase tracking-wide

## Component patterns

### KPI Card
```tsx
<div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{label}</p>
  <p className="text-3xl font-bold font-mono mt-1">{value}</p>
  <p className="text-sm mt-1 flex items-center gap-1">
    <TrendIcon />
    <span className={positive ? "text-green-700" : "text-red-700"}>{change}</span>
  </p>
</div>
```

### Data table
- Sticky header, zebra rows (bg-gray-50 on even)
- Numeric columns: right-aligned, font-mono
- Sort indicators on column headers
- Row hover: bg-blue-50/40

### Charts
- Always include a legend
- Tooltips must show exact values with currency formatting
- Use area charts for portfolio growth (filled, 20% opacity)
- Use bar charts for monthly comparisons
- Avoid pie charts for more than 5 segments — use treemap instead
- Grid lines: dashed, gray-200

### Forms (inputs for financial data)
- Currency inputs: left-aligned $ prefix, right-aligned number
- Always show validation inline (not only on submit)
- Confirm destructive actions (delete, reset) with a modal

## Layout

### Mobile-first approach
Always write base classes for mobile, then layer breakpoints:
```tsx
// Correct — mobile-first
<div className="flex flex-col md:flex-row">
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

// Wrong — desktop-first
<div className="flex flex-row mobile:flex-col">
```

### Breakpoints (Tailwind defaults)
- `sm`: 640px — larger phones / small tablets
- `md`: 768px — tablets, sidebar appears
- `lg`: 1024px — desktop, full dashboard
- `xl`: 1280px — wide screens, max content width

### Dashboard grid (mobile → desktop)
```
Mobile  (<md):  bottom nav + single-column stack
Tablet  (md+):  sidebar 240px fixed + main content
Desktop (lg+):  sidebar 240px + 2-col card grid
Wide    (xl+):  max-w-[1280px] centered
```

```tsx
// Shell structure
<div className="flex flex-col min-h-screen md:flex-row">
  <nav className="fixed bottom-0 w-full md:static md:w-60 md:min-h-screen" />
  <main className="flex-1 p-4 pb-20 md:pb-4 md:p-6 max-w-[1280px]">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {/* KPI cards */}
    </div>
  </main>
</div>
```

### Navigation
- **Mobile**: fixed bottom tab bar (4-5 icons max, labeled)
- **md+**: collapsible left sidebar with labels
- Active state: accent color + bold label

### KPI cards
- Mobile: full-width, stacked
- `sm:` 2 per row
- `lg:` 3-4 per row

### Tables on mobile
- Horizontal scroll (`overflow-x-auto`) — never truncate financial data
- Prioritize columns: hide secondary columns on mobile with `hidden md:table-cell`

### Charts on mobile
- Minimum height: 200px on mobile, 300px on md+
- Legend below chart on mobile (`layout="horizontal"` bottom), side on lg+
- Larger touch targets on tooltips

### Spacing scale (mobile-first)
- Card gap: `gap-4 md:gap-6`
- Section spacing: `mb-6 md:mb-10`
- Inner card padding: `p-4 md:p-6`

## Naming conventions
- Components: PascalCase (`PortfolioCard`, `NetWorthChart`)
- CSS classes: Tailwind only — no custom CSS unless animating
- Test ids: `data-testid="kpi-total-value"`

## Accessibility checklist
- [ ] All interactive elements reachable by Tab
- [ ] Chart data available as an accessible table alternative
- [ ] Color is never the only indicator (add icons or labels)
- [ ] Focus ring visible (`focus-visible:ring-2`)
- [ ] `aria-label` on icon-only buttons
