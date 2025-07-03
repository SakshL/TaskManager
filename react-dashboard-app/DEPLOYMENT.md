# TaskTide - Vercel Deployment Guide

## 🚀 Deployment Steps

### 1. Environment Variables Setup
In your Vercel dashboard, go to your project settings and add these environment variables:

```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_GOOGLE_CALENDAR_API_KEY=your_google_calendar_api_key
VITE_GOOGLE_CALENDAR_CLIENT_ID=your_google_client_id
```

### 2. Build Configuration
The `vercel.json` is already configured with:
- Correct Vite build settings
- SPA routing support
- Environment variable mapping

### 3. Deploy
1. Connect your GitHub repository to Vercel
2. Set the environment variables in Vercel dashboard
3. Deploy!

## 🛠️ Troubleshooting

### 404 Errors
- Ensure `vercel.json` routes are configured (✅ Done)
- Check that environment variables use `VITE_` prefix (✅ Fixed)
- Make sure `public/_redirects` exists (✅ Created)

### Build Errors
- Run `npm run build` locally first to test
- Check TypeScript errors: `npm run lint`
- Verify all dependencies are in package.json

### Environment Variables
- Use `VITE_` prefix (not `REACT_APP_`)
- Set them in Vercel dashboard, not in code
- Restart deployment after adding variables

## 📝 Notes
- The app uses Firebase for authentication and data
- OpenAI API for AI assistant features
- Google Calendar API for calendar integration
- All routes are handled by React Router
