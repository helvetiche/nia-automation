# Security Implementation Guide

## Proxy Layer (proxy.ts)

The proxy layer handles security headers and request/response manipulation. It does NOT handle authentication.

### Security Headers Applied
- X-Frame-Options: Prevents clickjacking
- X-Content-Type-Options: Prevents MIME sniffing
- Referrer-Policy: Controls referrer information
- Permissions-Policy: Restricts browser features
- Strict-Transport-Security: Forces HTTPS
- Content-Security-Policy: Prevents XSS attacks

### What Proxy Does NOT Do
- Authentication checks (security vulnerability CVE-2025-29927)
- Authorization validation
- Session management
- Database queries

## Authentication Guards (lib/auth/guards.ts)

All API routes must use authentication guards at the route handler level.

### Available Guards

**requireAuth(request)**
- Validates Firebase token
- Returns user info (uid, email, role)
- Use for any authenticated endpoint

**requireOperator(request)**
- Validates Firebase token
- Checks for operator role
- Use for admin/operator-only endpoints

### Usage Pattern

```typescript
export async function GET(request: NextRequest) {
  const authResult = await requireOperator(request);
  if ("error" in authResult) return authResult.error;
  
  const userId = authResult.user.uid;
  
  // your business logic here
}
```

## Request Flow

```
Client Request
    ↓
Proxy Layer (headers only)
    ↓
Route Handler
    ↓
Auth Guard (requireAuth/requireOperator)
    ↓
Input Validation
    ↓
Business Logic
    ↓
Database Operations (admin SDK only)
    ↓
Response
```

## Critical Rules

1. Never use Firebase client SDK in API routes
2. Always use admin SDK with service account
3. Auth checks happen in route handlers, not proxy
4. Validate all user inputs before database operations
5. Use batch writes for multi-document updates
6. Return human-readable error messages
7. Never expose sensitive data in error responses

## Migration from middleware.ts

The old `lib/auth/middleware.ts` verifyOperator function is deprecated. Use the new guards:

**Before:**
```typescript
const token = request.headers.get("authorization")?.split("Bearer ")[1];
const decodedToken = await verifyOperator(token);
```

**After:**
```typescript
const authResult = await requireOperator(request);
if ("error" in authResult) return authResult.error;
```

## Environment Variables

Never commit these to git:
- FIREBASE_SERVICE_ACCOUNT_KEY
- Any database credentials
- API keys

Use NEXT_PUBLIC_ prefix only for safe public values like Firebase project ID.
