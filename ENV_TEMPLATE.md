# Environment Variables Template

## For Production (Netlify)

Add these environment variables in Netlify Dashboard:

```bash
# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n
```

## How to Get Values

1. Open `firebase-service-account.json` in your local project
2. Copy the values:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY`

## Important Notes

- **DO NOT** commit `firebase-service-account.json` to Git
- **DO NOT** share these values publicly
- Keep `\n` in the private key (don't replace with actual newlines)
- After adding variables, redeploy your site on Netlify

## See Full Documentation

Read `NETLIFY_ENV_SETUP.md` for detailed setup instructions.
