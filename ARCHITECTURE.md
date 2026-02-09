# Security Architecture

## Overview

This application uses a layered security approach following Next.js 16 best practices and addressing CVE-2025-29927.

## Layer 1: Proxy (proxy.ts)

**Purpose:** Request/response manipulation and security headers

**Responsibilities:**
- Add security headers to all responses
- Generate CSP nonces
- Configure CORS if needed
- URL rewrites and redirects

**Does NOT handle:**
- Authentication
- Authorization
- Session management

## Layer 2: Route Handlers (app/api/**/route.ts)

**Purpose:** Business logic and data operations

**Flow:**
1. Receive request
2. Call auth guard
3. Validate inputs
4. Execute business logic
5. Return response

**Example:**
```typescript
export async function POST(request: NextRequest) {
  const authResult = await requireOperator(request);
  if ("error" in authResult) return authResult.error;
  
  const userId = authResult.user.uid;
  
  try {
    const body = await request.json();
    
    const validation = validateRequired({
      name: body.name,
      type: body.type,
    });
    
    if (!validation.valid) {
      return NextResponse.json(
        { error: `missing: ${validation.missing.join(", ")}` },
        { status: 400 }
      );
    }
    
    const result = await adminDb()
      .collection("items")
      .add({
        userId,
        name: sanitizeString(body.name),
        type: sanitizeString(body.type),
        createdAt: new Date().toISOString(),
      });
    
    return NextResponse.json({ id: result.id });
  } catch (error) {
    console.error("operation failed:", error);
    return NextResponse.json(
      { error: "something broke" },
      { status: 500 }
    );
  }
}
```

## Layer 3: Auth Guards (lib/auth/guards.ts)

**Purpose:** Token validation and role checking

**Available Guards:**
- `requireAuth` - Any authenticated user
- `requireOperator` - Operator role only

**Returns:**
- Success: `{ user: { uid, email, role } }`
- Failure: `{ error: NextResponse }`

## Layer 4: Input Validation (lib/validation/sanitize.ts)

**Purpose:** Sanitize and validate user inputs

**Functions:**
- `sanitizeString` - Trim and limit length
- `sanitizeNumber` - Clamp to range
- `sanitizeBoolean` - Convert to boolean
- `sanitizeArray` - Limit array length
- `validateRequired` - Check required fields
- `isValidEmail` - Email format validation
- `isValidId` - ID format validation

## Layer 5: Database (Firebase Admin SDK)

**Purpose:** Data persistence

**Rules:**
- Always use admin SDK in API routes
- Never use client SDK in API routes
- Use batch writes for multiple operations
- Implement proper error handling
- Log errors without exposing sensitive data

## Security Checklist

Every API route must:
- [ ] Use auth guard at the start
- [ ] Validate all inputs
- [ ] Sanitize user data
- [ ] Use admin SDK only
- [ ] Handle errors gracefully
- [ ] Return human-readable errors
- [ ] Not expose sensitive data
- [ ] Use batch writes when needed

## Client-Side Security

**Firebase Client SDK Usage:**
- Authentication only (sign in, sign out)
- Never direct Firestore access
- Never direct Storage access
- All data operations through API routes

**Environment Variables:**
- `NEXT_PUBLIC_*` - Safe for client (project ID, etc)
- No `NEXT_PUBLIC_` prefix - Server-only (service account, secrets)

## Deployment

**Vercel Configuration:**
1. Set environment variables in dashboard
2. Never commit secrets to git
3. Use different values for dev/staging/prod
4. Enable deployment protection
5. Configure custom domains with SSL

## Monitoring

**What to Monitor:**
- Failed auth attempts
- API error rates
- Database read/write counts
- Response times
- Unusual traffic patterns

**Tools:**
- Vercel Analytics
- Firebase Console
- Custom logging service
- Error tracking (Sentry recommended)

## Common Patterns

**Pagination:**
```typescript
const limit = sanitizeNumber(
  request.nextUrl.searchParams.get("limit"),
  1,
  100
);
```

**Filtering:**
```typescript
const folderId = request.nextUrl.searchParams.get("folderId");
if (folderId && !isValidId(folderId)) {
  return NextResponse.json(
    { error: "invalid folder id" },
    { status: 400 }
  );
}
```

**Batch Operations:**
```typescript
const batch = adminDb().batch();

items.forEach((item) => {
  const ref = adminDb().collection("items").doc(item.id);
  batch.update(ref, { status: "processed" });
});

await batch.commit();
```

## Testing Security

1. Test without auth token
2. Test with expired token
3. Test with wrong role
4. Test with invalid inputs
5. Test with SQL injection attempts
6. Test with XSS payloads
7. Test rate limiting
8. Test concurrent requests

## Resources

- [Next.js 16 Proxy Docs](https://nextjs.org/docs/app/getting-started/proxy)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [OWASP Security Guidelines](https://owasp.org)
