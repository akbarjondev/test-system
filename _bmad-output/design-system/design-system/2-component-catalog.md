# 2. Component Catalog

All components live in `apps/admin-dashboard/components/ui/`.

### 2.1 Button

**File:** `components/ui/button.tsx`
Built with Class Variance Authority (CVA) on top of Radix UI Slot.

#### Variants

| Variant | Visual | Use |
|---|---|---|
| `default` | Charcoal fill, white text | Primary actions: Save, Create |
| `destructive` | Red fill, white text | Delete, Remove — irreversible |
| `outline` | Border only, transparent bg | Secondary actions: Edit, View |
| `secondary` | Light gray fill | Tertiary actions |
| `ghost` | Transparent, hover bg | Navigation links, icon buttons in sidebar |
| `link` | Underline on hover | In-text links |

#### Sizes

| Size | Height | Use |
|---|---|---|
| `sm` | h-8 | Compact table actions |
| `default` | h-9 | Standard |
| `lg` | h-10 | Prominent CTAs |
| `icon` | size-9 | Icon-only buttons |
| `icon-sm` | size-7 | Inline icon buttons (e.g., edit inside list) |

#### Usage Examples

```tsx
// Primary action
<Button>Saqlash</Button>

// Secondary with icon
<Button variant="outline" size="sm" asChild>
  <Link href="/edit"><PencilIcon className="size-4 mr-1" />Tahrirlash</Link>
</Button>

// Destructive
<Button variant="destructive" size="sm">O'chirish</Button>

// Icon only
<Button variant="outline" size="icon">
  <PencilIcon className="size-4" />
</Button>
```

### 2.2 Badge

**File:** `components/ui/badge.tsx`
Used exclusively for status indicators, roles, and labels — not for actions.

#### Variants

| Variant | Visual (current) | Visual (after DS-1/DS-2) | Use |
|---|---|---|---|
| `default` | Charcoal bg | Same | Admin role, general labels |
| `secondary` | Light gray | Same | Student role, neutral labels |
| `destructive` | Red bg | Same | Critical errors |
| `outline` | Border only | Same | Pending / in-progress status |
| `success` | `bg-green-100 text-green-800` | `bg-success text-success-foreground` | Passed, submitted |
| `error` | `bg-red-100 text-red-800` | `bg-error text-error-foreground` | Failed |
| `warning` | `bg-orange-100 text-orange-700` | `bg-warning text-warning-foreground` | Timed out, alerts |

#### Usage Examples

```tsx
// Attempt result
<Badge variant="success">O'tdi</Badge>
<Badge variant="error">O'tmadi</Badge>
<Badge variant="warning">Vaqt tugadi</Badge>
<Badge variant="outline">Jarayonda</Badge>

// User role
<Badge variant="default">Admin</Badge>
<Badge variant="secondary">O'quvchi</Badge>
```

### 2.3 Card

**File:** `components/ui/card.tsx`
Use Card and its sub-components instead of raw `div` with border/background classes.

#### Sub-components

| Component | Purpose |
|---|---|
| `Card` | Outer container — `rounded-xl border bg-card shadow-sm` |
| `CardHeader` | Top section — grid layout with auto-rows |
| `CardTitle` | Bold heading inside header |
| `CardDescription` | Muted subtitle inside header |
| `CardContent` | Main content area |
| `CardFooter` | Bottom action row |
| `CardAction` | Action slot within header (top-right) |

#### Stat Card Pattern (replaces current raw `div`)

```tsx
<Card className={warning ? "border-warning" : ""}>
  <CardContent className="pt-6">
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className={cn("text-4xl font-bold mt-1", warning && "text-warning")}>
      {value}
    </p>
  </CardContent>
</Card>
```

### 2.4 Input & Field

**Files:** `components/ui/input.tsx`, `components/ui/field.tsx`

Always pair `Input` with `Field` wrappers in forms for consistent label + error display.

```tsx
<FieldGroup>
  <Field>
    <FieldLabel>Sarlavha</FieldLabel>
    <Input {...register("title")} placeholder="Test nomi..." />
    {errors.title && <FieldError>{errors.title.message}</FieldError>}
  </Field>
</FieldGroup>
```

### 2.5 Table & DataTable

**Files:** `components/ui/table.tsx`, `components/data-table.tsx`

Two table patterns exist — choose based on need:

| Component | Use When |
|---|---|
| `Table` (basic) | Simple read-only lists, no sorting/pagination needed |
| `DataTable` | Sortable columns, client-side pagination, clickable rows |

#### Table Wrapper (required)

Plain `Table` must always be wrapped in this container:

```tsx
<div className="rounded-xl border border-border overflow-hidden bg-card">
  <Table>
    <TableHeader>...</TableHeader>
    <TableBody>...</TableBody>
  </Table>
</div>
```

#### DataTable

`DataTable` in `components/data-table.tsx` already handles its own wrapper styling. Pass `columns` and `data`:

```tsx
<DataTable columns={columns} data={attempts} />
```

---
