# Migration Guide: Secure Auth Pattern

## What Changed

Next.js 16 renamed middleware to proxy and fixed a critical security vulnerability. Auth checks must now happen in route handlers, not in proxy/middleware.

## Files Created

1. `proxy.ts` - Security headers and request manipulation
2. `lib/auth/guards.ts` - Auth validation functions
3. `SECURITY.md` - Security implementation docs

## How to Update Your API Routes

### Step 1: Update Imports

**Old:**
```typescript
import { verifyOperator } from "@/lib/auth/middleware";
```

**New:**
```typescript
import { requireOperator } from "@/lib/auth/guards";
```

### Step 2: Replace Auth Logic

**Old Pattern:**
```typescript
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.split("Bearer ")[1];
    if (!token) {
      return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }
    
    const decodedToken = await verifyOperator(token);
    const userId = decodedToken.uid;
    
    // business logic
  } catch (error) {
    // error handling
  }
}
```

**New Pattern:**
```typescript
export async function GET(request: NextRequest) {
  const authResult = await requireOperator(request);
  if ("error" in authResult) return authResult.error;
  
  const userId = authResult.user.uid;
  
  try {
    // business logic
  } catch (error) {
    // error handling
  }
}
```

## Routes to Update

Update all routes in `app/api/` that use authentication:

- [ ] app/api/auth/login/route.ts
- [ ] app/api/files/[id]/area/route.ts
- [ ] app/api/files/[id]/notice/route.ts
- [ ] app/api/files/[id]/pdf/route.ts
- [ ] app/api/files/move/route.ts
- [ ] app/api/files/pages/route.ts
- [ ] app/api/files/scan/route.ts
- [ ] app/api/files/upload/route.ts
- [ ] app/api/folders/[id]/notice/route.ts
- [ ] app/api/folders/route.ts
- [ ] app/api/folders/sync/route.ts
- [ ] app/api/reports/lipa/route.ts
- [ ] app/api/reports/preview/route.ts
- [ ] app/api/reports/settings/route.ts
- [ ] app/api/stats/route.ts
- [ ] app/api/templates/route.ts
- [ ] app/api/templates/upload/route.ts

## Example: Complete Route Update

```typescript
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/adminConfig";
import { requireOperator } from "@/lib/auth/guards";

export async function POST(request: NextRequest) {
  const authResult = await requireOperator(request);
  if ("error" in authResult) return authResult.error;
  
  const userId = authResult.user.uid;
  
  try {
    const body = await request.json();
    
    // validate inputs
    if (!body.name) {
      return NextResponse.json(
        { error: "name is required" },
        { status: 400 }
      );
    }
    
    // business logic
    const result = await adminDb()
      .collection("items")
      .add({
        userId,
        name: body.name,
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

## Testing

After updating each route:

1. Test with valid auth token
2. Test with missing token
3. Test with invalid token
4. Test with wrong role (if using requireOperator)
5. Run `npm run lint` to check for issues

## Cleanup

After all routes are migrated, you can delete:
- `lib/auth/middleware.ts` (old auth logic)
