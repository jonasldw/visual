# API Client Guidelines

## TypeScript Patterns

### Request Function Implementation
Use standard `RequestInit` types and explicit JSON serialization:

```typescript
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  // ... error handling
  return await response.json();
}
```

### API Method Implementation
Always use explicit `JSON.stringify()` for request bodies:

```typescript
create: async (customer: CustomerCreate): Promise<Customer> => {
  return request<Customer>('/api/v1/customers', {
    method: 'POST',
    body: JSON.stringify(customer),
  });
}
```

## Best Practices

### Type Safety
- Use proper TypeScript interfaces for request/response types
- Avoid `any` types - use `unknown` when necessary
- Let TypeScript infer return types when possible

### Error Handling
- Always handle HTTP error responses
- Parse error details from API responses when available
- Provide meaningful error messages to users

### Performance
- Use explicit typing over runtime type checking
- Prefer standard fetch API patterns over custom abstractions
- Keep request functions simple and predictable

## Anti-Patterns to Avoid

❌ **Don't use complex type manipulation:**
```typescript
// Avoid this
options: Omit<RequestInit, 'body'> & { body?: unknown }
```

✅ **Use standard types with explicit handling:**
```typescript
// Prefer this
options: RequestInit = {}
body: JSON.stringify(data)
```

❌ **Don't auto-detect and transform request bodies:**
```typescript
// Avoid this
if (options.body && typeof options.body === 'object') {
  config.body = JSON.stringify(options.body);
}
```

✅ **Be explicit about data transformation:**
```typescript
// Prefer this
body: JSON.stringify(customer)
```