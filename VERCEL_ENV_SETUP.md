# 🔧 Vercel Environment Variables Setup

## ❌ Error Fixed
- Removed the problematic `env` section from `vercel.json`
- Now you need to manually add environment variables in Vercel dashboard

## 📋 Environment Variables to Add in Vercel Dashboard

Go to your Vercel project → Settings → Environment Variables and add these **exactly**:

### Firebase Configuration
```
VITE_FIREBASE_API_KEY = AIzaSyDNdyln3e3zfRtMs8gRwpnCDwyVnB80w3o
VITE_FIREBASE_AUTH_DOMAIN = studentmanagerr-632e5.firebaseapp.com
VITE_FIREBASE_PROJECT_ID = studentmanagerr-632e5
VITE_FIREBASE_STORAGE_BUCKET = studentmanagerr-632e5.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID = 1067720396369
VITE_FIREBASE_APP_ID = 1:1067720396369:web:bc0489cf45ee5960667270
VITE_FIREBASE_MEASUREMENT_ID = G-PZNY9B4Y2T
VITE_FIREBASE_DATABASE_URL = https://studentmanagerr-632e5-default-rtdb.firebaseio.com
```

### API Keys
```
VITE_OPENAI_API_KEY = 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
VITE_GOOGLE_CALENDAR_CLIENT_ID = 217094234574-2jboolti9bbjj1ps4v4p284m6v2nnonq.apps.googleusercontent.com
VITE_GOOGLE_CALENDAR_CLIENT_SECRET = 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
```

## 🚀 Steps to Deploy

1. **Add Environment Variables**:
   - Copy each variable name and value from above
   - Paste them into Vercel dashboard (Settings → Environment Variables)
   - Set Environment to: **Production**, **Preview**, and **Development**

2. **Redeploy**:
   - Go to Deployments tab
   - Click "Redeploy" on latest deployment
   - OR push a new commit to auto-deploy

3. **Verify Deployment**:
   - Check that the build completes successfully
   - Test the deployed app functionality

## ⚠️ Important Notes

- **Don't include spaces** around the `=` sign when adding to Vercel
- **Include all variables** - missing ones will cause runtime errors
- **Set for all environments** (Production, Preview, Development) if needed
- **Wait for redeploy** after adding variables

## 🎯 Expected Result
After adding all environment variables and redeploying, your TaskTide app should:
- ✅ Build successfully without environment variable errors
- ✅ Deploy without 404 errors
- ✅ Connect to Firebase properly
- ✅ Have working AI chat functionality
- ✅ Have working Google Calendar integration

Your deployment should now work perfectly! 🚀
