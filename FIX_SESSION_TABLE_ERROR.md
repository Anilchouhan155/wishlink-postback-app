# Fix: "Prisma session table does not exist"

## Root Cause

This error occurs when:
1. **DATABASE_URL / DIRECT_URL are missing or wrong in Vercel** → Prisma can't connect
2. **Stale build cache** → Vercel uses old build with SQLite schema
3. **Wrong database** → Vercel points to a different Neon project than where migrations ran

## Fix Steps

### Step 1: Verify Vercel Environment Variables

In Vercel → Settings → Environment Variables, ensure you have:

| Variable | Value | Apply to |
|---------|-------|----------|
| `DATABASE_URL` | `postgresql://neondb_owner:PASSWORD@ep-hidden-silence-a1vvr44s-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require` | All |
| `DIRECT_URL` | Same as above (or use direct/non-pooler URL) | All |

**Important:** No trailing spaces, no line breaks. Copy exactly from Neon dashboard.

### Step 2: Force a Fresh Build

Vercel may be using a cached build with old SQLite schema. Force a new build:

**Option A - Push empty commit:**
```bash
cd wishlink-postback-app
git add .
git commit -m "Force Vercel rebuild" --allow-empty
git push
```

**Option B - Redeploy with cache clear:**
1. Vercel → Deployments → ⋮ on latest
2. Click **Redeploy**
3. If available, enable **"Clear build cache"** or **"Redeploy with no cache"**

### Step 3: Test Database Connection

After redeploying, visit:
```
https://wishlink-postback-app.vercel.app/api/health
```

**Expected (success):**
```json
{"status":"ok","database":"connected","sessionTableExists":true,"sessionCount":0}
```

**If you see error:** The response will show the actual database error. Share it to debug further.

### Step 4: Verify GitHub Has Latest Code

Ensure your repo has the PostgreSQL schema:

```bash
# Check schema
cat prisma/schema.prisma | head -15
```

Should show:
```
provider  = "postgresql"
url       = env("DATABASE_URL")
directUrl = env("DIRECT_URL")
```

If you see `provider = "sqlite"`, push the latest code.

---

## Quick Checklist

- [ ] DATABASE_URL set in Vercel (Production + Preview)
- [ ] DIRECT_URL set in Vercel (Production + Preview)
- [ ] Force redeploy / clear cache
- [ ] /api/health returns `"database":"connected"`
- [ ] Trigger webhook again
