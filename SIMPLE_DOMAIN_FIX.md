# Simple Domain Fix for Firebase

## Current Domain
`216c1f5a-f216-440a-befe-23d92ad25e2e.riker.prod.repl.run`

## Firebase Setup (Add Current Domain)

Since wildcards aren't supported, add the current domain:

1. Go to Firebase Console → Authentication → Settings → Authorized domains
2. Add: `216c1f5a-f216-440a-befe-23d92ad25e2e.riker.prod.repl.run`
3. Save changes

## When Domain Changes Again

The app will show you the new domain in the error message. Simply add that new domain to Firebase authorized domains.

## Alternative Solution: Deploy to Replit

For a permanent fix, deploy the app using Replit's deploy feature. This gives you a stable `.replit.app` domain that won't change.

## Current Approach
- Using popup authentication (simpler than redirect)
- Clear error messages showing exact domain to add
- Works immediately once domain is authorized