# Error Response Format

All API errors must use this shape:

```typescript
// Simple error
res.status(404).json({ error: "Test not found" });

// With code (for programmatic handling)
res.status(429).json({ error: "Too many requests", code: "TOO_MANY_REQUESTS" });

// Validation error (produced by validate middleware automatically)
res.status(400).json({
  error: "Validation failed",
  details: [{ field: "email", message: "Invalid email" }]
});
```

Never return raw error objects or stack traces to the client.

---
