# Wildcard Domain Solution for Replit

## Current Issue
Domain keeps changing: `216c1f5a-f216-440a-befe-23d92ad25e2e.riker.prod.repl.run`

## Permanent Solution

Add a wildcard domain pattern to Firebase authorized domains:

1. Go to Firebase Console → Authentication → Settings → Authorized domains
2. Add this wildcard pattern:
   ```
   *.riker.prod.repl.run
   ```

This will authorize ALL Replit production domains ending with `.riker.prod.repl.run`

## Alternative Domains to Add:
- `*.replit.dev` (for development domains)
- `*.replit.app` (for deployed apps)
- `senali-235fb.firebaseapp.com` (Firebase's stable domain)

## Benefits:
- One-time setup covers all future Replit domains
- No more constant domain updates
- Works across development and production environments