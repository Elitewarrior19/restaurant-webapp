# Deployment Guide — Lala's Foods

## Pre-deploy Checklist

### 1. Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```

### 2. Environment Variables
Copy `.env.example` to `.env.local` and set:

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_CLOUDINARY_PRESET` | **Yes** (for image uploads) | Cloudinary unsigned upload preset |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Optional | Falls back to default |
| `NEXT_PUBLIC_FIREBASE_*` | Optional | Falls back to default project |
| `GOOGLE_GEOCODING_API_KEY` | Optional | Reverse geocode for "Current location" at checkout |

### 3. Build & Run
```bash
npm install
npm run build
npm start
```

## Deploy to Vercel
1. Connect your repo to Vercel
2. Add environment variables in Project Settings
3. Deploy — Vercel uses `next build` automatically

## Deploy to other platforms
- Use `npm run build` + `npm start`
- Ensure `.env` or platform env vars are configured
