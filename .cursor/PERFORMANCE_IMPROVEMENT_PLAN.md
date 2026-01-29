# Performance Improvement Plan
**Based on Vercel React Best Practices Analysis**

**Date:** January 23, 2026  
**Codebase:** `apps/admin-dashboard` (Next.js 16.1.1, React 19.2.3)  
**Status:** Analysis Complete - Ready for Implementation

---

## 📊 Executive Summary

This plan identifies **45 potential improvements** across 8 priority categories based on the installed `vercel-react-best-practices` skill. The codebase is currently in early development with minimal implementation, making this an ideal time to establish performance-optimized patterns.

**Current State:**
- ✅ Next.js 16.1.1 with App Router (modern setup)
- ✅ React 19.2.3 (latest)
- ⚠️ Minimal implementation (starter template + basic login page)
- ⚠️ No data fetching patterns yet
- ⚠️ No error boundaries or loading states
- ⚠️ No Suspense boundaries

**Impact Assessment:**
- **Critical (Priority 1-2):** 10 improvements - Will prevent major performance issues
- **High (Priority 3-4):** 9 improvements - Important for production readiness
- **Medium (Priority 5-6):** 15 improvements - Quality of life and UX
- **Low (Priority 7-8):** 11 improvements - Fine-tuning optimizations

---

## 🎯 Priority 1: Eliminating Waterfalls (CRITICAL)

### 1.1 Plan for Parallel Data Fetching
**Rule:** `async-parallel`  
**Current Issue:** No data fetching yet, but planned routes will need multiple API calls  
**Impact:** HIGH - Prevents sequential loading delays

**Recommendation:**
- When implementing `/` (overview page), ensure all data fetches happen in parallel:
  - Tests count
  - Recent attempts
  - User stats
- Use `Promise.all()` or parallel server components
- Example pattern for `/app/(dashboard)/page.tsx`:
  ```typescript
  // ✅ CORRECT: Parallel fetching
  const [tests, attempts, stats] = await Promise.all([
    fetchTests(),
    fetchRecentAttempts(),
    fetchStats()
  ]);
  ```

**Files to Update:**
- `app/(dashboard)/page.tsx` (when implementing overview)
- `app/(dashboard)/tests/page.tsx` (when implementing tests list)
- `app/(dashboard)/tests/[testId]/page.tsx` (test detail + questions + attempts)

---

### 1.2 Use Suspense Boundaries for Streaming
**Rule:** `async-suspense-boundaries`  
**Current Issue:** No Suspense boundaries planned  
**Impact:** HIGH - Enables progressive rendering

**Recommendation:**
- Wrap independent data sections in Suspense boundaries
- Use for:
  - Test list (can stream while loading)
  - Questions list (separate from test metadata)
  - Attempts list (separate from test details)
- Pattern:
  ```typescript
  <Suspense fallback={<TestsSkeleton />}>
    <TestsList />
  </Suspense>
  <Suspense fallback={<QuestionsSkeleton />}>
    <QuestionsList />
  </Suspense>
  ```

**Files to Create/Update:**
- `app/(dashboard)/tests/page.tsx`
- `app/(dashboard)/tests/[testId]/questions/page.tsx`
- `app/(dashboard)/tests/[testId]/attempts/page.tsx`

---

### 1.3 Defer Await in Conditional Branches
**Rule:** `async-defer-await`  
**Current Issue:** Not applicable yet, but will be when implementing conditional data fetching  
**Impact:** MEDIUM - Prevents unnecessary blocking

**Recommendation:**
- When implementing role-based data fetching (admin vs creator), move `await` into branches
- Example: Only fetch user list if user is admin

**Files to Monitor:**
- `app/(dashboard)/users/page.tsx` (when implementing)
- Any conditional data fetching logic

---

### 1.4 API Route Optimization
**Rule:** `async-api-routes`  
**Current Issue:** No Next.js API routes yet (using external API)  
**Impact:** LOW - Only if adding Next.js API routes

**Recommendation:**
- If creating Next.js API routes, start promises early, await late
- Pattern: Initialize all fetches, then await when needed

---

## 📦 Priority 2: Bundle Size Optimization (CRITICAL)

### 2.1 Avoid Barrel Imports
**Rule:** `bundle-barrel-imports`  
**Current Issue:** No barrel files detected yet, but monitor as codebase grows  
**Impact:** HIGH - Prevents unnecessary code inclusion

**Recommendation:**
- Import directly from source files:
  ```typescript
  // ❌ AVOID (if barrel file exists)
  import { Button, Input, Card } from '@/components/ui'
  
  // ✅ CORRECT
  import { Button } from '@/components/ui/button'
  import { Input } from '@/components/ui/input'
  ```
- Check `packages/ui/src/index.ts` if it exists - ensure it doesn't re-export everything

**Files to Monitor:**
- All component imports
- `packages/ui/src/index.ts` (if created)

---

### 2.2 Dynamic Imports for Heavy Components
**Rule:** `bundle-dynamic-imports`  
**Current Issue:** No heavy components yet, but planned features will need this  
**Impact:** HIGH - Reduces initial bundle size

**Recommendation:**
- Use `next/dynamic` for:
  - Charts/graphs (if adding analytics)
  - Rich text editors (if adding question editor)
  - Data tables with sorting/filtering
  - Modal dialogs (only load when needed)
- Example:
  ```typescript
  const DataTable = dynamic(() => import('@/components/DataTable'), {
    loading: () => <TableSkeleton />
  });
  ```

**Components to Consider:**
- Test editor (if using rich text)
- Charts for analytics dashboard
- Large data tables
- Export functionality

---

### 2.3 Defer Third-Party Scripts
**Rule:** `bundle-defer-third-party`  
**Current Issue:** No analytics/logging scripts yet  
**Impact:** MEDIUM - Prevents blocking hydration

**Recommendation:**
- When adding analytics (e.g., Vercel Analytics, Google Analytics):
  - Load after hydration using `useEffect`
  - Use `next/script` with `strategy="afterInteractive"`
  - Or use dynamic imports in client components

**Implementation Pattern:**
```typescript
// In layout or analytics component
useEffect(() => {
  // Load analytics after hydration
  import('./analytics').then(module => module.init());
}, []);
```

---

### 2.4 Conditional Module Loading
**Rule:** `bundle-conditional`  
**Current Issue:** Not applicable yet  
**Impact:** MEDIUM - Load features only when needed

**Recommendation:**
- Load admin-only features conditionally
- Load user management only for admins
- Example: Dynamic import for `/users` routes if user is not admin

---

### 2.5 Preload on Hover/Focus
**Rule:** `bundle-preload`  
**Current Issue:** No navigation links with heavy pages yet  
**Impact:** LOW-MEDIUM - Improves perceived performance

**Recommendation:**
- When implementing sidebar navigation:
  - Preload routes on hover/focus
  - Use `next/link` with prefetch (default behavior)
  - Consider manual prefetch for heavy pages

**Files to Update:**
- `app/(dashboard)/layout.tsx` (sidebar navigation)

---

## 🖥️ Priority 3: Server-Side Performance (HIGH)

### 3.1 Use React.cache() for Request Deduplication
**Rule:** `server-cache-react`  
**Current Issue:** No server components with data fetching yet  
**Impact:** HIGH - Prevents duplicate API calls per request

**Recommendation:**
- Wrap API fetch functions with `React.cache()`:
  ```typescript
  import { cache } from 'react';
  
  export const getTests = cache(async () => {
    const res = await fetch(`${API_URL}/tests`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  });
  ```
- Use in server components that might be called multiple times in the same request

**Files to Create:**
- `lib/api/tests.ts`
- `lib/api/questions.ts`
- `lib/api/attempts.ts`
- `lib/api/users.ts`

---

### 3.2 LRU Cache for Cross-Request Caching
**Rule:** `server-cache-lru`  
**Current Issue:** No caching strategy  
**Impact:** HIGH - Reduces API load and improves response times

**Recommendation:**
- Implement LRU cache for:
  - Test metadata (changes infrequently)
  - User roles/permissions
  - Question templates
- Use library like `lru-cache` or Next.js `unstable_cache`
- Set appropriate TTL based on data volatility

**Files to Create:**
- `lib/cache/tests-cache.ts`
- `lib/cache/users-cache.ts`

---

### 3.3 Minimize Client Component Data
**Rule:** `server-serialization`  
**Current Issue:** No data passing to client components yet  
**Impact:** HIGH - Reduces payload size

**Recommendation:**
- Pass only necessary data to client components
- Avoid passing full database objects
- Use DTOs (Data Transfer Objects) with only required fields
- Example: Pass `{ id, title, count }` instead of full test object with all relations

**Pattern:**
```typescript
// ✅ CORRECT: Minimal data
interface TestSummary {
  id: string;
  title: string;
  questionCount: number;
}

// ❌ AVOID: Full object with relations
interface Test {
  id: string;
  title: string;
  questions: Question[];
  attempts: Attempt[];
  // ... many more fields
}
```

---

### 3.4 Parallelize Server Component Fetches
**Rule:** `server-parallel-fetching`  
**Current Issue:** No server components with multiple fetches yet  
**Impact:** HIGH - Prevents sequential waterfalls

**Recommendation:**
- Structure components to fetch in parallel:
  - Test detail page: Fetch test + questions + attempts in parallel
  - Overview page: Fetch all stats in parallel
- Use separate server components for independent data

**Files to Update:**
- `app/(dashboard)/tests/[testId]/page.tsx` (when implementing)
- `app/(dashboard)/page.tsx` (overview)

---

### 3.5 Use after() for Non-Blocking Operations
**Rule:** `server-after-nonblocking`  
**Current Issue:** No background operations yet  
**Impact:** MEDIUM - Improves response time

**Recommendation:**
- Use `after()` for:
  - Logging analytics events
  - Sending notifications
  - Updating cache
  - Any operation that doesn't affect response

**Example:**
```typescript
import { after } from 'next/server';

export async function POST(request: Request) {
  const data = await request.json();
  
  // Critical operation
  const result = await saveTest(data);
  
  // Non-blocking operations
  after(() => {
    logAnalytics('test_created', result.id);
    updateCache(result);
  });
  
  return Response.json(result);
}
```

---

### 3.6 Authentication Actions Pattern
**Rule:** `server-auth-actions`  
**Current Issue:** Login page has no form handling  
**Impact:** HIGH - Security and UX

**Recommendation:**
- Implement server actions for authentication
- Use Next.js server actions instead of API routes for form submissions
- Pattern:
  ```typescript
  // app/actions/auth.ts
  'use server';
  
  export async function loginAction(formData: FormData) {
    const email = formData.get('email');
    const password = formData.get('password');
    // Validate and authenticate
  }
  ```

**Files to Create:**
- `app/actions/auth.ts`
- Update `app/login/page.tsx` to use server action

---

### 3.7 Deduplicate Props
**Rule:** `server-dedup-props`  
**Current Issue:** No prop passing patterns yet  
**Impact:** MEDIUM - Prevents unnecessary serialization

**Recommendation:**
- Avoid passing the same data to multiple child components
- Use context or fetch once at parent level
- Pass IDs instead of full objects when possible

---

## 📡 Priority 4: Client-Side Data Fetching (MEDIUM-HIGH)

### 4.1 Use SWR for Request Deduplication
**Rule:** `client-swr-dedup`  
**Current Issue:** No client-side data fetching yet  
**Impact:** HIGH - Prevents duplicate requests and provides caching

**Recommendation:**
- Install `swr` package
- Use for:
  - Real-time test list updates
  - Attempt status polling
  - User permissions checking
- Provides automatic:
  - Request deduplication
  - Caching
  - Revalidation
  - Error handling

**Implementation:**
```typescript
import useSWR from 'swr';

function TestsList() {
  const { data, error, isLoading } = useSWR('/api/tests', fetcher);
  // ...
}
```

**Files to Update:**
- Install `swr` in `package.json`
- Create `lib/hooks/use-tests.ts`
- Use in client components that need live data

---

### 4.2 Deduplicate Global Event Listeners
**Rule:** `client-event-listeners`  
**Current Issue:** No global event listeners yet  
**Impact:** MEDIUM - Prevents memory leaks

**Recommendation:**
- When adding global listeners (scroll, resize, keyboard shortcuts):
  - Use a single listener with event delegation
  - Or use a custom hook that manages listener lifecycle
  - Clean up in `useEffect` return

**Pattern:**
```typescript
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    // Handle event
  };
  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, []);
```

---

### 4.3 LocalStorage Schema Management
**Rule:** `client-localstorage-schema`  
**Current Issue:** No localStorage usage yet, but planned for auth token  
**Impact:** MEDIUM - Prevents data corruption

**Recommendation:**
- Define schema for stored data:
  - Auth token structure
  - User preferences
  - Cache keys
- Use versioned schema for migrations
- Validate on read

**Files to Create:**
- `lib/storage/auth-storage.ts`
- `lib/storage/schema.ts`

---

### 4.4 Passive Event Listeners
**Rule:** `client-passive-event-listeners`  
**Current Issue:** No scroll/resize listeners yet  
**Impact:** LOW - Improves scroll performance

**Recommendation:**
- When adding scroll/touch listeners, use `{ passive: true }`:
  ```typescript
  element.addEventListener('scroll', handler, { passive: true });
  ```

---

## 🔄 Priority 5: Re-render Optimization (MEDIUM)

### 5.1 Defer State Reads Used Only in Callbacks
**Rule:** `rerender-defer-reads`  
**Current Issue:** No complex state management yet  
**Impact:** MEDIUM - Prevents unnecessary re-renders

**Recommendation:**
- When implementing forms with callbacks:
  - Don't subscribe to state only used in event handlers
  - Use refs or read from event object instead

**Example:**
```typescript
// ❌ AVOID: Subscribes to state
const [value, setValue] = useState('');
<Input onChange={(e) => {
  setValue(e.target.value);
  // value is only used here
}} />

// ✅ CORRECT: Read from event
<Input onChange={(e) => {
  const newValue = e.target.value;
  // Use newValue directly
}} />
```

---

### 5.2 Memoize Expensive Components
**Rule:** `rerender-memo`  
**Current Issue:** Components are simple, but will need this as they grow  
**Impact:** MEDIUM - Prevents expensive re-renders

**Recommendation:**
- Use `React.memo()` for:
  - Data table rows
  - Question list items
  - Test cards in grid view
- Only if component receives stable props and is expensive to render

**Components to Consider:**
- `TestCard` (when implementing)
- `QuestionItem` (when implementing)
- `AttemptRow` (when implementing)

---

### 5.3 Use Primitive Dependencies in Effects
**Rule:** `rerender-dependencies`  
**Current Issue:** No complex effects yet  
**Impact:** MEDIUM - Prevents effect re-runs

**Recommendation:**
- Extract primitive values from objects for dependency arrays
- Use `useMemo` for derived values if needed in dependencies

**Pattern:**
```typescript
// ❌ AVOID
useEffect(() => {
  fetchData(user.id);
}, [user]); // user object changes reference

// ✅ CORRECT
useEffect(() => {
  fetchData(userId);
}, [userId]); // primitive value
```

---

### 5.4 Subscribe to Derived Booleans
**Rule:** `rerender-derived-state`  
**Current Issue:** No derived state yet  
**Impact:** LOW-MEDIUM - Reduces re-renders

**Recommendation:**
- When checking permissions or conditions:
  - Subscribe to `isAdmin` boolean instead of full `user.role`
  - Subscribe to `hasAttempts` instead of `attempts.length > 0`

---

### 5.5 Functional setState for Stable Callbacks
**Rule:** `rerender-functional-setstate`  
**Current Issue:** No setState in callbacks yet  
**Impact:** LOW-MEDIUM - Prevents dependency issues

**Recommendation:**
- Use functional setState when new state depends on previous:
  ```typescript
  // ✅ CORRECT
  setCount(prev => prev + 1);
  ```

---

### 5.6 Lazy State Initialization
**Rule:** `rerender-lazy-state-init`  
**Current Issue:** No expensive initial state  
**Impact:** LOW - Prevents unnecessary computation

**Recommendation:**
- If initial state requires expensive computation, pass function:
  ```typescript
  // ✅ CORRECT
  const [data] = useState(() => expensiveComputation());
  ```

---

### 5.7 Use Transitions for Non-Urgent Updates
**Rule:** `rerender-transitions`  
**Current Issue:** No state updates that could block UI  
**Impact:** MEDIUM - Improves perceived performance

**Recommendation:**
- Use `useTransition` for:
  - Search/filter operations
  - Tab switching
  - List sorting
- Keeps UI responsive during updates

**Example:**
```typescript
const [isPending, startTransition] = useTransition();

const handleSearch = (query: string) => {
  startTransition(() => {
    setFilteredResults(filterResults(query));
  });
};
```

---

## 🎨 Priority 6: Rendering Performance (MEDIUM)

### 6.1 Hoist Static JSX
**Rule:** `rendering-hoist-jsx`  
**Current Issue:** `app/page.tsx` has static JSX that could be hoisted  
**Impact:** LOW-MEDIUM - Reduces re-render work

**Recommendation:**
- Extract static JSX from `app/page.tsx` outside component:
  ```typescript
  const staticContent = (
    <div className="flex flex-col items-center gap-6">
      {/* Static content */}
    </div>
  );
  
  export default function Home() {
    return <>{staticContent}</>;
  }
  ```

**Files to Update:**
- `app/page.tsx` (extract static sections)

---

### 6.2 Use Ternary Instead of && for Conditionals
**Rule:** `rendering-conditional-render`  
**Current Issue:** No conditional rendering issues detected  
**Impact:** LOW - Prevents rendering bugs

**Recommendation:**
- Use ternary for conditionals that might render `0` or `false`:
  ```typescript
  // ❌ AVOID: Renders "0" if count is 0
  {count && <Badge>{count}</Badge>}
  
  // ✅ CORRECT
  {count > 0 ? <Badge>{count}</Badge> : null}
  ```

---

### 6.3 Content Visibility for Long Lists
**Rule:** `rendering-content-visibility`  
**Current Issue:** No long lists yet, but planned  
**Impact:** MEDIUM - Improves rendering performance

**Recommendation:**
- When implementing test/question/attempt lists:
  - Use `content-visibility: auto` for list items
  - Or implement virtual scrolling for very long lists
  - CSS:
    ```css
    .list-item {
      content-visibility: auto;
      contain-intrinsic-size: 0 100px;
    }
    ```

**Components to Update:**
- Test list (when implementing)
- Question list
- Attempt list

---

### 6.4 Inline Script for Client-Only Data
**Rule:** `rendering-hydration-no-flicker`  
**Current Issue:** No client-only data yet  
**Impact:** MEDIUM - Prevents hydration mismatches

**Recommendation:**
- For theme, user preferences, or other client-only data:
  - Use inline script in layout to set initial values
  - Prevents flash of wrong content

**Pattern:**
```typescript
// In layout.tsx
<script
  dangerouslySetInnerHTML={{
    __html: `window.__THEME__ = '${theme}';`
  }}
/>
```

---

### 6.5 Activity Component Pattern
**Rule:** `rendering-activity`  
**Current Issue:** No show/hide patterns yet  
**Impact:** LOW - Cleaner conditional rendering

**Recommendation:**
- Create reusable `Activity` component for show/hide:
  ```typescript
  <Activity show={isLoading}>
    <Spinner />
  </Activity>
  ```

---

## ⚡ Priority 7: JavaScript Performance (LOW-MEDIUM)

### 7.1 Batch DOM/CSS Changes
**Rule:** `js-batch-dom-css`  
**Current Issue:** No manual DOM manipulation yet  
**Impact:** LOW - Only if adding animations or DOM manipulation

**Recommendation:**
- If adding animations or DOM manipulation:
  - Group CSS changes via classes or `cssText`
  - Use `requestAnimationFrame` for smooth updates

---

### 7.2 Index Maps for Repeated Lookups
**Rule:** `js-index-maps`  
**Current Issue:** No repeated lookups detected  
**Impact:** LOW - Only if processing large arrays

**Recommendation:**
- When implementing search/filter:
  - Build Map/Set for O(1) lookups instead of array.find()
  - Example: Map test IDs to test objects

---

### 7.3 Cache Property Access in Loops
**Rule:** `js-cache-property-access`  
**Current Issue:** No loops with property access yet  
**Impact:** LOW - Only if processing large datasets

**Recommendation:**
- When processing arrays:
  - Cache object properties accessed in loops
  - Example: `const length = items.length;` before loop

---

### 7.4 Cache Function Results
**Rule:** `js-cache-function-results`  
**Current Issue:** No expensive pure functions yet  
**Impact:** LOW - Only if adding expensive computations

**Recommendation:**
- For expensive pure functions:
  - Cache results in module-level Map
  - Or use `useMemo` in components

---

### 7.5 Cache Storage Reads
**Rule:** `js-cache-storage`  
**Current Issue:** No localStorage reads yet  
**Impact:** LOW - Only if reading storage frequently

**Recommendation:**
- Cache localStorage/sessionStorage reads
- Read once, store in state/context

---

### 7.6 Combine Iterations
**Rule:** `js-combine-iterations`  
**Current Issue:** No array processing yet  
**Impact:** LOW - Only if processing arrays

**Recommendation:**
- Combine multiple `filter`/`map` operations into single loop
- Example: Filter and map in one pass

---

### 7.7 Length Check First
**Rule:** `js-length-check-first`  
**Current Issue:** No array comparisons yet  
**Impact:** LOW - Only if comparing arrays

**Recommendation:**
- Check array length before expensive comparison
- Early exit if lengths differ

---

### 7.8 Early Exit from Functions
**Rule:** `js-early-exit`  
**Current Issue:** No complex functions yet  
**Impact:** LOW - General best practice

**Recommendation:**
- Return early from functions when conditions aren't met
- Reduces nesting and improves readability

---

### 7.9 Hoist RegExp Creation
**Rule:** `js-hoist-regexp`  
**Current Issue:** No regex usage yet  
**Impact:** LOW - Only if using regex in loops

**Recommendation:**
- Create RegExp outside loops
- Store in module-level constant

---

### 7.10 Use Loop for Min/Max
**Rule:** `js-min-max-loop`  
**Current Issue:** No min/max operations yet  
**Impact:** LOW - Only if finding min/max

**Recommendation:**
- Use loop instead of `sort()` for finding min/max
- O(n) vs O(n log n)

---

### 7.11 Set/Map for O(1) Lookups
**Rule:** `js-set-map-lookups`  
**Current Issue:** No lookup operations yet  
**Impact:** LOW - Only if doing frequent lookups

**Recommendation:**
- Use Set/Map for O(1) lookups instead of array.includes()
- Example: Check if test ID exists

---

### 7.12 Use toSorted() for Immutability
**Rule:** `js-tosorted-immutable`  
**Current Issue:** No sorting yet  
**Impact:** LOW - Only if sorting arrays

**Recommendation:**
- Use `toSorted()` instead of `sort()` to avoid mutating original array
- Modern JavaScript feature

---

## 🔧 Priority 8: Advanced Patterns (LOW)

### 8.1 Event Handler Refs
**Rule:** `advanced-event-handler-refs`  
**Current Issue:** No event handler patterns yet  
**Impact:** LOW - Advanced optimization

**Recommendation:**
- Store event handlers in refs if they're recreated frequently
- Prevents child re-renders

---

### 8.2 useLatest Hook
**Rule:** `advanced-use-latest`  
**Current Issue:** No callback ref patterns yet  
**Impact:** LOW - Advanced optimization

**Recommendation:**
- Use `useLatest` hook for stable callback refs
- Ensures callbacks always have latest values

---

## 📋 Implementation Checklist

### Phase 1: Critical (Before Production)
- [ ] Implement parallel data fetching patterns
- [ ] Add Suspense boundaries for streaming
- [ ] Set up React.cache() for request deduplication
- [ ] Implement LRU cache for cross-request caching
- [ ] Add server actions for authentication
- [ ] Install and configure SWR for client-side fetching
- [ ] Avoid barrel imports
- [ ] Plan dynamic imports for heavy components

### Phase 2: High Priority (Before Launch)
- [ ] Minimize data passed to client components
- [ ] Structure components for parallel fetching
- [ ] Add error boundaries (not-found, error, global-error)
- [ ] Add loading states
- [ ] Implement localStorage schema for auth
- [ ] Defer third-party scripts (when added)

### Phase 3: Medium Priority (Post-Launch)
- [ ] Optimize re-renders with memo
- [ ] Use transitions for non-urgent updates
- [ ] Hoist static JSX
- [ ] Add content-visibility for long lists
- [ ] Implement proper conditional rendering

### Phase 4: Low Priority (Ongoing)
- [ ] JavaScript micro-optimizations
- [ ] Advanced patterns as needed

---

## 🎯 Quick Wins (Implement First)

1. **Add Suspense boundaries** - Easy, high impact
2. **Install SWR** - Simple setup, prevents many issues
3. **Use React.cache()** - Critical for server components
4. **Avoid barrel imports** - Easy to maintain
5. **Add error boundaries** - Required for production

---

## 📝 Notes

- Many optimizations are **proactive** since codebase is early stage
- Focus on establishing patterns now rather than refactoring later
- Some rules may not apply until specific features are implemented
- Revisit this plan as features are added

---

**Next Steps:**
1. Review this plan with team
2. Prioritize based on immediate needs
3. Implement Phase 1 items before adding major features
4. Update plan as codebase evolves
