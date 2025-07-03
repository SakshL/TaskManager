# TaskTide - Vercel Deployment Guide

## 🚀 Deployment Steps

### 1. Repository Structure
```
TaskManager/
├── vercel.json          (✅ Root config file)
├── react-dashboard-app/ (React app folder)
│   ├── src/
│   ├── public/
│   │   └── _redirects   (✅ SPA routing)
│   ├── package.json
│   └── ...
```

### 2. Vercel Configuration
The `vercel.json` in the root directory is configured to:
- Use static build from `react-dashboard-app` subdirectory
- Build using the package.json in the subdirectory
- Handle SPA routing for React Router
- **Key Fix**: Uses `builds` array instead of build commands for better subdirectory support

### 3. Environment Variables Setup
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

### 4. Deploy
1. Connect your GitHub repository to Vercel (use the TaskManager root folder)
2. **Important**: Don't select just the react-dashboard-app folder, select the entire repository
3. Set the environment variables in Vercel dashboard
4. Deploy! Vercel will automatically detect and use the root `vercel.json` configuration

## 🛠️ Troubleshooting

### 404 Errors on Refresh
- ✅ `vercel.json` in root with `builds` array configuration
- ✅ Routes configured to redirect all requests to `/index.html`
- ✅ SPA routing properly handled

### Build Errors
- Vercel will automatically build from the `react-dashboard-app` subdirectory
- Check that the React app builds locally: `cd react-dashboard-app && npm run build`
- Verify all dependencies are in package.json
- Ensure TypeScript compiles without errors

### Environment Variables
- ✅ Use `VITE_` prefix (not `REACT_APP_`)
- Set them in Vercel dashboard, not in code
- Restart deployment after adding variables

### Deployment Checklist
1. ✅ Root `vercel.json` with builds array configuration
2. ✅ Remove any duplicate `vercel.json` from subdirectory
3. ✅ All environment variables set in Vercel dashboard
4. ✅ Firebase domains configured for your Vercel URL
5. ✅ Google OAuth configured for your Vercel URL

## 📝 Latest Configuration Changes
- ✅ Updated `vercel.json` to use `builds` array for better monorepo support
- ✅ Removed duplicate `vercel.json` from subdirectory
- ✅ Verified build process works correctly
- ✅ Configured proper SPA routing for React Router

## 🔧 Local Testing
```bash
cd react-dashboard-app
npm install
npm run build    # Test production build
npm run preview  # Test built app locally
```
