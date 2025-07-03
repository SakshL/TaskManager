# Task Manager - Productivity Dashboard

A modern, full-featured Task Manager web application built with React, TypeScript, and Firebase.

## Features

- **Task Management**: Create, edit, delete, and organize tasks by priority and subject
- **Authentication**: Google Sign-In and email/password authentication
- **Pomodoro Timer**: Built-in focus timer with customizable work/break sessions
- **Analytics**: Visual analytics dashboard with charts and productivity insights
- **AI Assistant**: OpenAI-powered task suggestions and productivity advice
- **Calendar Integration**: View and manage tasks in calendar format
- **Responsive Design**: Modern UI built with Tailwind CSS

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI**: Tailwind CSS, Lucide React Icons
- **Charts**: Recharts
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **AI**: OpenAI API
- **Deployment**: Vercel

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_OPENAI_API_KEY=your_openai_api_key
```

## Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create and configure your `.env` file
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Building for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Deployment to Vercel

### Option 1: Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

### Option 2: GitHub Integration

1. Push your code to a GitHub repository
2. Connect your GitHub account to Vercel
3. Import your project from GitHub
4. Configure environment variables in Vercel dashboard
5. Deploy

### Environment Variables for Vercel

In your Vercel dashboard, add the following environment variables:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`
- `VITE_OPENAI_API_KEY`

## Firebase Setup

1. Create a new Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication with Google and Email/Password providers
3. Create a Firestore database
4. Update your environment variables with your Firebase config

## OpenAI Setup

1. Create an account at [platform.openai.com](https://platform.openai.com)
2. Generate an API key
3. Add the API key to your environment variables

## Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── charts/       # Chart components
│   ├── layout/       # Layout components (Sidebar, TopBar)
│   ├── tasks/        # Task-related components
│   └── ui/           # Generic UI components
├── hooks/            # Custom React hooks
├── pages/            # Page components
├── services/         # Firebase and API services
├── styles/           # Global styles
├── types/            # TypeScript type definitions
└── utils/            # Utility functions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## License

MIT
- **Analytics**: Uses Recharts to display analytics data in a visually appealing format.
- **AI Integration**: Connects with the OpenAI API to provide AI features and assistance.
- **Calendar View**: Incorporates FullCalendar or React Big Calendar for managing and viewing events.

## Pages

- **Dashboard**: A placeholder for the main dashboard view.
- **Tasks**: A placeholder for managing tasks.
- **Calendar**: A placeholder for the calendar view.
- **AI Assistant**: A placeholder for the AI assistant features.
- **Settings**: A placeholder for user settings and configurations.

## Installation

To get started with the project, follow these steps:

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd react-dashboard-app
   ```

3. Install the dependencies:
   ```
   npm install
   ```

4. Set up Firebase and OpenAI API keys in the environment variables.

5. Start the development server:
   ```
   npm start
   ```

## Technologies Used

- React
- TypeScript
- Tailwind CSS
- Firebase
- Firestore
- React Router
- Recharts
- OpenAI API
- FullCalendar or React Big Calendar

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.
