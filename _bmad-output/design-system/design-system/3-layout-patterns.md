# 3. Layout Patterns

### 3.1 Page Shell

Every dashboard page should use this outer structure:

```tsx
<div className="space-y-8">
  {/* Page header */}
  <div>
    <h1 className="text-2xl font-bold">{pageTitle}</h1>
    <p className="text-sm text-muted-foreground mt-1">{pageSubtitle}</p>
  </div>

  {/* Content sections follow as direct children */}
  <section>...</section>
  <section>...</section>
</div>
```

**Rules:**
- `space-y-8` at the root — never mix `mb-*` and `space-y-*` on siblings
- H1 is always `text-2xl font-bold`
- Subtitle is always `text-sm text-muted-foreground mt-1`

### 3.2 Stat Cards Grid

```tsx
<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
  <Card>
    <CardContent className="pt-6">
      <p className="text-sm text-muted-foreground">Jami testlar</p>
      <p className="text-4xl font-bold mt-1">{stats.totalTests}</p>
    </CardContent>
  </Card>
  {/* ... */}
</div>
```

- Grid: `grid-cols-2` mobile → `sm:grid-cols-4` desktop
- Gap: `gap-4`
- Warning variant: add `border-warning` to Card and `text-warning` to value

### 3.3 Table Wrapper

```tsx
<div className="rounded-xl border border-border overflow-hidden bg-card">
  <Table>...</Table>
</div>
```

- Never hardcode `border-zinc-200 dark:border-zinc-800` or `bg-white dark:bg-zinc-900`

### 3.4 Actions Row

For pages with both a page title and a primary action button:

```tsx
<div className="flex items-center justify-between">
  <h1 className="text-2xl font-bold">{title}</h1>
  <Button asChild>
    <Link href="/new"><PlusIcon className="size-4 mr-1" />Yangi test</Link>
  </Button>
</div>
```

For detail pages with multiple sibling actions:

```tsx
<div className="flex gap-2">
  <Button variant="outline" size="sm">...</Button>
  <Button variant="destructive" size="sm">...</Button>
</div>
```

### 3.5 Empty State

```tsx
{items.length === 0 ? (
  <div className="text-center py-12">
    <p className="text-sm text-muted-foreground">Hali ma'lumot yo'q.</p>
    <Button className="mt-4" asChild>
      <Link href="/new">Yaratish</Link>
    </Button>
  </div>
) : (
  <DataTable ... />
)}
```

- Text: `text-sm text-muted-foreground` — never `text-gray-500`
- Include a primary CTA when creation is possible

---
