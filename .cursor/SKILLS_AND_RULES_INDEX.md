# Skills and Rules Index

**Last Updated:** January 23, 2026  
**Status:** Active Map

---

## 📋 Overview

This document serves as the master index of all installed skills and rules in the workspace, providing a comprehensive map for AI agents and developers.

---

## 🎯 Workspace Rules

### 1. `autmation-development-workflow-and-docs`
**Location:** `.cursor/rules/autmation-development-workflow-and-docs.mdc`

**Purpose:** Automates app analysis and documentation generation

**Capabilities:**
- **App Analysis:**
  - Runs dev server with `npm run dev`
  - Fetches logs from console
  - Suggests performance improvements

- **Documentation Generation:**
  - Extracts code comments
  - Analyzes README.md
  - Generates markdown documentation

---

## 🚀 Installed Skills

### 1. `vercel-react-best-practices`
**Location:** `.agents/skills/vercel-react-best-practices/`  
**Version:** 1.0.0  
**Author:** vercel  
**License:** MIT

**Description:** Comprehensive performance optimization guide for React and Next.js applications, maintained by Vercel. Contains 45 rules across 8 categories, prioritized by impact.

**When to Apply:**
- Writing new React components or Next.js pages
- Implementing data fetching (client or server-side)
- Reviewing code for performance issues
- Refactoring existing React/Next.js code
- Optimizing bundle size or load times

---

## 📚 Rule Categories (vercel-react-best-practices)

### Priority 1: Eliminating Waterfalls (CRITICAL)
**Prefix:** `async-`
- `async-defer-await` - Move await into branches where actually used
- `async-parallel` - Use Promise.all() for independent operations
- `async-dependencies` - Use better-all for partial dependencies
- `async-api-routes` - Start promises early, await late in API routes
- `async-suspense-boundaries` - Use Suspense to stream content

### Priority 2: Bundle Size Optimization (CRITICAL)
**Prefix:** `bundle-`
- `bundle-barrel-imports` - Import directly, avoid barrel files
- `bundle-dynamic-imports` - Use next/dynamic for heavy components
- `bundle-defer-third-party` - Load analytics/logging after hydration
- `bundle-conditional` - Load modules only when feature is activated
- `bundle-preload` - Preload on hover/focus for perceived speed

### Priority 3: Server-Side Performance (HIGH)
**Prefix:** `server-`
- `server-cache-react` - Use React.cache() for per-request deduplication
- `server-cache-lru` - Use LRU cache for cross-request caching
- `server-serialization` - Minimize data passed to client components
- `server-parallel-fetching` - Restructure components to parallelize fetches
- `server-after-nonblocking` - Use after() for non-blocking operations
- `server-auth-actions` - Authentication action patterns
- `server-dedup-props` - Deduplicate props passed to components

### Priority 4: Client-Side Data Fetching (MEDIUM-HIGH)
**Prefix:** `client-`
- `client-swr-dedup` - Use SWR for automatic request deduplication
- `client-event-listeners` - Deduplicate global event listeners
- `client-localstorage-schema` - LocalStorage schema patterns
- `client-passive-event-listeners` - Use passive event listeners

### Priority 5: Re-render Optimization (MEDIUM)
**Prefix:** `rerender-`
- `rerender-defer-reads` - Don't subscribe to state only used in callbacks
- `rerender-memo` - Extract expensive work into memoized components
- `rerender-dependencies` - Use primitive dependencies in effects
- `rerender-derived-state` - Subscribe to derived booleans, not raw values
- `rerender-functional-setstate` - Use functional setState for stable callbacks
- `rerender-lazy-state-init` - Pass function to useState for expensive values
- `rerender-transitions` - Use startTransition for non-urgent updates
- `rerender-memo-with-default-value` - Memo patterns with default values
- `rerender-simple-expression-in-memo` - Simple expressions in memo

### Priority 6: Rendering Performance (MEDIUM)
**Prefix:** `rendering-`
- `rendering-animate-svg-wrapper` - Animate div wrapper, not SVG element
- `rendering-content-visibility` - Use content-visibility for long lists
- `rendering-hoist-jsx` - Extract static JSX outside components
- `rendering-svg-precision` - Reduce SVG coordinate precision
- `rendering-hydration-no-flicker` - Use inline script for client-only data
- `rendering-activity` - Use Activity component for show/hide
- `rendering-conditional-render` - Use ternary, not && for conditionals
- `rendering-usetransition-loading` - Use useTransition for loading states

### Priority 7: JavaScript Performance (LOW-MEDIUM)
**Prefix:** `js-`
- `js-batch-dom-css` - Group CSS changes via classes or cssText
- `js-index-maps` - Build Map for repeated lookups
- `js-cache-property-access` - Cache object properties in loops
- `js-cache-function-results` - Cache function results in module-level Map
- `js-cache-storage` - Cache localStorage/sessionStorage reads
- `js-combine-iterations` - Combine multiple filter/map into one loop
- `js-length-check-first` - Check array length before expensive comparison
- `js-early-exit` - Return early from functions
- `js-hoist-regexp` - Hoist RegExp creation outside loops
- `js-min-max-loop` - Use loop for min/max instead of sort
- `js-set-map-lookups` - Use Set/Map for O(1) lookups
- `js-tosorted-immutable` - Use toSorted() for immutability

### Priority 8: Advanced Patterns (LOW)
**Prefix:** `advanced-`
- `advanced-event-handler-refs` - Store event handlers in refs
- `advanced-use-latest` - useLatest for stable callback refs

---

## 📊 Summary Statistics

- **Total Skills:** 1
- **Total Workspace Rules:** 1
- **Total Performance Rules:** 45
- **Rule Categories:** 8
- **Priority Levels:** 8 (Critical → Low)

---

## 🔍 Quick Reference

### Finding Rules
- **Workspace Rules:** `.cursor/rules/`
- **Skill Rules:** `.agents/skills/{skill-name}/rules/`
- **Skill Documentation:** `.agents/skills/{skill-name}/SKILL.md`
- **Full Compiled Guide:** `.agents/skills/{skill-name}/AGENTS.md`

### Rule File Structure
Each rule file contains:
- Brief explanation of why it matters
- Incorrect code example with explanation
- Correct code example with explanation
- Additional context and references

---

## ✅ Acknowledgment

**This index serves as my operational map.** I will:
- Reference these skills and rules when working on React/Next.js code
- Apply performance optimizations according to priority
- Use the automation workflow rule for app analysis and documentation
- Follow the categorized patterns for code review and refactoring

**Status:** ✅ Indexed and Acknowledged
