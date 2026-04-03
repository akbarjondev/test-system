---
name: general-best-practices
description: General software development best practices for TypeScript and code quality. Apply when writing, reviewing, or refactoring any TypeScript code in this project to ensure correctness, maintainability, and clarity.
license: MIT
metadata:
  author: project
  version: "1.0.0"
---

# General Best Practices

TypeScript correctness and code quality rules for this project. 15 rules across 3 categories.

## When to Apply

Reference these guidelines when:
- Writing new TypeScript code (API, dashboard, bot)
- Reviewing or refactoring existing code
- Designing function signatures or data structures
- Naming variables, functions, or types

## Rule Categories by Priority

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Backend Safety | CRITICAL | `backend-` |
| 2 | TypeScript Correctness | HIGH | `ts-` |
| 3 | Code Quality | MEDIUM | `quality-` |

## Quick Reference

### 1. Backend Safety (CRITICAL)

- `backend-no-raw-body-to-prisma` — Never spread `req.body` into Prisma; destructure only expected fields
- `backend-transactions-multi-step` — Use `prisma.$transaction()` for writes spanning multiple models
- `backend-no-prisma-model-in-response` — Never return raw Prisma models; use `select` or a DTO

### 2. TypeScript Correctness (HIGH)

- `ts-no-any` — Use `unknown` instead of `any`; narrow with type guards
- `ts-explicit-return-types` — Always annotate function return types
- `ts-type-guards` — Narrow types with guards; avoid `as` casting
- `ts-readonly-params` — Mark object params `readonly` when not mutated
- `ts-discriminated-unions` — Use discriminated unions for variant shapes

### 3. Code Quality (MEDIUM)

- `quality-single-responsibility` — Each function/class does exactly one thing
- `quality-early-return` — Guard clauses instead of deeply nested `if`
- `quality-pure-functions` — Prefer pure functions; isolate side effects
- `quality-naming` — Names describe *what*, not *how*
- `quality-no-magic-numbers` — Named constants over bare literals
- `quality-small-functions` — Keep functions under ~25 lines
- `quality-dry` — Extract duplication, but don't over-abstract prematurely

## How to Use

Read individual rule files for explanations and code examples:

```
rules/backend-no-raw-body-to-prisma.md
rules/backend-transactions-multi-step.md
rules/backend-no-prisma-model-in-response.md
rules/ts-no-any.md
rules/ts-explicit-return-types.md
rules/ts-type-guards.md
rules/ts-readonly-params.md
rules/ts-discriminated-unions.md
rules/quality-single-responsibility.md
rules/quality-early-return.md
rules/quality-pure-functions.md
rules/quality-naming.md
rules/quality-no-magic-numbers.md
rules/quality-small-functions.md
rules/quality-dry.md
```

For the complete guide with all rules expanded: `AGENTS.md`
