# CSS Golden Rules - ${infoConfig.abbriviation}Frontend Style Guide

## 📋 Table of Contents

1. [Color System](#color-system)
2. [Typography](#typography)
3. [Spacing & Layout](#spacing--layout)
4. [Component Patterns](#component-patterns)
5. [Utility Classes](#utility-classes)
6. [Best Practices](#best-practices)
7. [Dark Mode](#dark-mode)
8. [Performance](#performance)

---

## 🎨 Color System

### Brand Colors (Primary)

```css
/* Use these as your main brand colors */
bg-brand-50    /* Lightest - backgrounds */
bg-brand-100   /* Very light - hover states */
bg-brand-200   /* Light - subtle backgrounds */
bg-brand-300   /* Medium light - borders */
bg-brand-400   /* Medium - secondary accents */
bg-brand-500   /* PRIMARY - main brand color */
bg-brand-600   /* Darker - hover states */
bg-brand-700   /* Dark - active states */
bg-brand-800   /* Very dark - text on light */
bg-brand-900   /* Darkest - heavy emphasis */
```

### Accent Colors (Secondary)

```css
/* Use for highlights, CTAs, important elements */
bg-accent-50   /* Lightest */
bg-accent-500  /* PRIMARY accent - call to action */
bg-accent-600  /* Hover states */
```

### Semantic Colors

```css
/* Status indicators */
bg-success    /* Green - approved, completed, active */
bg-warning    /* Yellow - pending, review needed */
bg-danger     /* Red - rejected, error, deleted */
bg-info       /* Blue - informational */
bg-neutral    /* Gray - neutral, draft */
```

### DO ✅

```tsx
// Use semantic color classes
<div className="bg-brand-500 text-white">Primary Button</div>
<div className="text-success-600">Approved</div>
<div className="bg-warning-100 text-warning-700">Pending</div>
```

### DON'T ❌

```tsx
// Don't hardcode hex values or use arbitrary colors
<div className="bg-[#1A6BF1] text-[#FFFFFF]">Bad</div>
<div style={{ color: '#FF9B1A' }}>Also Bad</div>
```

---

## 📝 Typography

### Font Hierarchy

```css
/* Heading Font (Sora) - Use for titles */
font-heading

/* Body Font (Cabin) - Default */
font-body

/* Alternative Fonts */
font-protest  /* Cabin - same as body */
font-jaro     /* Lato - for special headings */
font-roboto   /* Montserrat - alternative */
```

### Text Size Scale

```css
/* Use these consistently */
text-xs   /* 0.75rem - Small labels, badges */
text-sm   /* 0.875rem - Secondary text, helper text */
text-base /* 1rem - Body text (default) */
text-lg   /* 1.125rem - Subheadings */
text-xl   /* 1.25rem - Small headings */
text-2xl  /* 1.5rem - Section headings */
text-3xl  /* 1.875rem - Page titles */
text-4xl  /* 2.25rem - Hero text */
```

### Font Weights

```css
font-light    /* 300 - Subtle text */
font-normal   /* 400 - Body text */
font-medium   /* 500 - Emphasized text */
font-semibold /* 600 - Subheadings */
font-bold     /* 700 - Headings */
font-extrabold /* 800 - Strong emphasis */
```

### DO ✅

```tsx
<h1 className="text-3xl font-bold font-heading">Page Title</h1>
<p className="text-base font-body text-gray-600">Body text</p>
<span className="text-sm font-medium text-brand-600">Label</span>
```

### DON'T ❌

```tsx
<h1 className="text-[32px] font-[700]">Inconsistent</h1>
<p style={{ fontSize: '16px' }}>Inline styles</p>
```

---

## 📐 Spacing & Layout

### Spacing Scale (Use consistently)

```css
/* Padding & Margin */
p-0   /* 0rem */
p-1   /* 0.25rem (4px) */
p-2   /* 0.5rem (8px) */
p-3   /* 0.75rem (12px) */
p-4   /* 1rem (16px) - DEFAULT */
p-5   /* 1.25rem (20px) */
p-6   /* 1.5rem (24px) */
p-8   /* 2rem (32px) */
p-10  /* 2.5rem (40px) */
p-12  /* 3rem (48px) */
p-16  /* 4rem (64px) */
p-20  /* 5rem (80px) */
p-24  /* 6rem (96px) */
```

### Gap Scale

```css
gap-0   /* 0rem */
gap-1   /* 0.25rem */
gap-2   /* 0.5rem */
gap-3   /* 0.75rem - DEFAULT for small */
gap-4   /* 1rem - DEFAULT for medium */
gap-6   /* 1.5rem - DEFAULT for large */
gap-8   /* 2rem */
gap-10  /* 2.5rem */
gap-12  /* 3rem */
```

### Container Widths

```css
/* Use container classes for consistency */
container      /* Max-width: 1400px */
max-w-7xl      /* 1280px - Main content */
max-w-6xl      /* 1152px */
max-w-5xl      /* 1024px */
max-w-4xl      /* 896px */
max-w-3xl      /* 768px - Forms, modals */
max-w-2xl      /* 672px */
max-w-xl       /* 576px */
max-w-lg       /* 512px */
max-w-md       /* 448px - Login/Register */
```

### DO ✅

```tsx
<div className="container mx-auto px-4">Centered content</div>
<div className="flex gap-4 items-center">Flex with spacing</div>
<div className="max-w-md mx-auto">Form container</div>
```

### DON'T ❌

```tsx
<div style={{ padding: '20px' }}>Hardcoded spacing</div>
<div className="gap-[14px]">Arbitrary gaps</div>
```

---

## 🧩 Component Patterns

### Button Variants

```tsx
// Primary - Main actions
<Button variant="primary">Submit</Button>

// Secondary - Alternative actions
<Button variant="secondary">Back</Button>

// Outline - Less prominent
<Button variant="outline">Cancel</Button>

// Ghost - Minimal
<Button variant="ghost">View More</Button>

// Danger - Destructive actions
<Button variant="danger">Delete</Button>

// Success - Confirm actions
<Button variant="success">Save</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// With icons
<Button leftIcon={<Icon />}>With Icon</Button>
<Button loading>Loading...</Button>
```

### Badge Variants

```tsx
// Status badges
<StatusBadge status="approved" />
<StatusBadge status="pending" />
<StatusBadge status="rejected" />

// Size options
<StatusBadge size="sm" status="draft" />
<StatusBadge size="lg" status="completed" />
```

### Input Patterns

```tsx
// Basic
<Input placeholder="Enter text" />

// With label
<Input label="Email" type="email" />

// With error
<Input label="Password" error="Password is required" />

// With helper
<Input helper="Enter a valid email" />

// With icons
<Input leftIcon={<MailIcon />} />
<Input rightIcon={<EyeIcon />} />
```

---

## 🛠️ Utility Classes

### Glass Effect

```css
.glass /* Light glass effect */
```

### Card Hover

```css
.card-hover /* Subtle lift on hover */
```

### Loading Shimmer

```css
.shimmer /* Animated loading skeleton */
```

### Gradients

```css
.bg-brand-gradient  /* Blue gradient */
.bg-accent-gradient /* Gold gradient */
.text-brand-gradient /* Gradient text */
```

### Custom Badges

```css
.badge
.badge-success
.badge-warning
.badge-danger
.badge-info
.badge-neutral
```

---

## ✅ Best Practices

### 1. Use Semantic Classes

```tsx
// ✅ DO
<div className="bg-brand-50 text-brand-700 p-4 rounded-lg">
  Success message
</div>

// ❌ DON'T
<div className="bg-blue-100 text-blue-800 p-4 rounded">
  Hardcoded colors
</div>
```

### 2. Maintain Consistent Spacing

```tsx
// ✅ DO - Use spacing scale
<div className="p-4 gap-4">
  Content
</div>

// ❌ DON'T - Arbitrary values
<div className="p-[15px] gap-[18px]">
  Content
</div>
```

### 3. Use Typography Scale

```tsx
// ✅ DO
<h2 className="text-2xl font-heading font-bold">Title</h2>
<p className="text-base font-body">Body</p>

// ❌ DON'T
<h2 style={{ fontSize: '28px' }}>Title</h2>
```

### 4. Leverage Utility Composition

```tsx
// ✅ DO - Compose utilities
<div className="flex items-center justify-between gap-4 p-6 bg-white rounded-xl shadow-sm">

// ❌ DON'T - Inline styles or custom CSS
<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
```

### 5. Use cn() for Conditional Classes

```tsx
// ✅ DO
import { cn } from "@/lib/utils";

<div className={cn(
  "base-classes",
  isActive && "active-classes",
  isDisabled && "opacity-50 cursor-not-allowed"
)}>

// ❌ DON'T
<div className={`base-classes ${isActive ? 'active-classes' : ''}`}>
```

---

## 🌙 Dark Mode

### Support Dark Mode

```tsx
// ✅ DO - Use dark: prefix
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">

// ✅ DO - Use semantic colors
<div className="bg-brand-50 dark:bg-brand-900">

// ❌ DON'T - Hardcode colors
<div className="bg-white text-black">
```

---

## ⚡ Performance

### 1. Avoid Inline Styles

```tsx
// ❌ DON'T - Causes re-renders
<div style={{ marginTop: '20px' }}>Content</div>

// ✅ DO - Use classes
<div className="mt-5">Content</div>
```

### 2. Use Tailwind's Production Optimization

```css
/* Tailwind automatically purges unused styles in production */
/* Always use complete class names, not dynamic strings */
```

### 3. Prefer Tailwind Classes Over Custom CSS

```tsx
// ✅ DO - Tailwind
<div className="flex flex-col gap-4 p-6">

// ❌ DON'T - Custom CSS if Tailwind can do it
<style>{`.container { display: flex; flex-direction: column; gap: 1rem; padding: 1.5rem; }`}</style>
```

---

## 📱 Responsive Design

### Breakpoints

```css
sm   /* 640px  - Mobile */
md   /* 768px  - Tablet */
lg   /* 1024px - Desktop */
xl   /* 1280px - Large Desktop */
2xl  /* 1536px - Extra Large */
```

### Responsive Patterns

```tsx
// ✅ DO
<div className="text-sm md:text-base lg:text-lg">
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
<div className="p-4 md:p-6 lg:p-8">

// ❌ DON'T
<div className="text-[14px] md:text-[16px]">
```

---

## 🎯 Quick Reference

### Most Used Classes

| Purpose        | Classes                                                 |
| -------------- | ------------------------------------------------------- |
| **Layout**     | `container`, `flex`, `grid`, `block`, `inline-flex`     |
| **Spacing**    | `p-4`, `m-4`, `gap-4`, `space-y-4`                      |
| **Colors**     | `bg-brand-500`, `text-brand-700`, `border-brand-200`    |
| **Typography** | `text-base`, `font-bold`, `font-heading`                |
| **States**     | `hover:bg-brand-600`, `focus:ring-2`, `active:scale-95` |
| **Responsive** | `sm:`, `md:`, `lg:`, `xl:`, `2xl:`                      |
| **Dark Mode**  | `dark:bg-gray-800`, `dark:text-white`                   |

---

## 🔧 Debugging Tips

### 1. Use DevTools

```bash
# In Chrome/Edge DevTools, check the "Computed" tab
# to see which styles are applied and from where
```

### 2. Check Class Order

```tsx
// Tailwind applies classes from right to left
// More specific classes should come last
// <div className="p-4 md:p-6"> {/* p-6 wins */} </div>
```

### 3. Use @apply for Repeated Patterns

```css
/* In your CSS file */
@layer components {
  .btn-primary {
    @apply bg-brand-500 text-white hover:bg-brand-600 focus:ring-brand-400;
  }
}
```

---

## 📚 Resources

1. **Tailwind Docs**: https://tailwindcss.com/docs
2. **Tailwind Cheatsheet**: https://nerdcave.com/tailwind-cheat-sheet
3. **Framer Motion**: https://www.framer.com/motion/
4. **Radix UI**: https://www.radix-ui.com/

---

## 🚀 Summary Checklist

- [ ] Use semantic color classes (brand-_, accent-_, status-*)
- [ ] Follow typography scale (text-sm, text-base, etc.)
- [ ] Use spacing scale (p-4, gap-4, etc.)
- [ ] Prefer Tailwind utilities over custom CSS
- [ ] Support dark mode with dark: prefix
- [ ] Make components responsive (md:, lg:, etc.)
- [ ] Use cn() for conditional classes
- [ ] Avoid inline styles
- [ ] Keep class names clean and organized
- [ ] Test with DevTools for debugging

---

_Last Updated: 2026_ | _Maintain consistency across the codebase_
