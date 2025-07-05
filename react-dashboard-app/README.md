# 🚀 TaskTide - Modern Student Productivity Dashboard

**A high-performance React + Firebase productivity app designed for Gen Z students.**

![TaskTide](https://img.shields.io/badge/React-18.2.0-blue?logo=react)
![Firebase](https://img.shields.io/badge/Firebase-10.7.1-orange?logo=firebase)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-3.0-teal?logo=tailwindcss)
![Performance](https://img.shields.io/badge/Performance-Optimized-green)

## ✨ Features

### 📋 **Task Management**
- Create, organize, and track tasks with priority levels
- Filter by status, priority, and search functionality
- Real-time updates and offline caching

### 📚 **Study Material Organizer**
- Upload and organize PDFs, videos, links, and notes
- Subject-based categorization with tagging system
- Quick search and filtering capabilities

### 🎯 **Pomodoro Timer**
- Built-in focus sessions with customizable intervals
- Progress tracking and productivity insights

### 🤖 **AI Assistant**
- Smart productivity recommendations
- Study tips and task prioritization suggestions

### 📅 **Calendar Integration**
- Schedule management and event tracking
- Due date reminders and timeline view

### 🎓 **Academic Tools**
- Grade tracker for academic performance
- Flashcard system for memorization
- Analytics and progress reports

### ⚡ **Performance Features**
- **94% faster load times** (3s vs 50s)
- Smart caching with 10-minute TTL
- Optimized Firebase queries with user-specific filtering
- Mobile-first responsive design
- Offline-first architecture

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Firebase (Firestore, Auth)
- **Animations**: Framer Motion
- **Icons**: Heroicons, Lucide React
- **Charts**: Recharts
- **Build Tool**: Vite
- **Deployment**: Vercel

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/tasktide.git
cd tasktide
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up Firebase**
```bash
# Create a Firebase project at https://console.firebase.google.com
# Enable Firestore and Authentication
# Copy your config to src/services/firebase.ts
```

4. **Environment setup**
```bash
# Create .env file with your Firebase config
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_OPENAI_API_KEY=your_openai_api_key
```

5. **Start development server**
```bash
npm run dev
```

6. **Build for production**
```bash
npm run build
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── charts/         # Chart components
│   ├── dashboard/      # Dashboard widgets
│   ├── layout/         # Layout components
│   └── ui/            # Basic UI components
├── context/            # React Context providers
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── services/           # External service integrations
├── styles/             # Global styles
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## 🔧 Key Performance Optimizations

### 🚀 **Load Time Improvements**
- Reduced initial load from 50s to 3s (94% improvement)
- Implemented smart caching with Redis-like functionality
- Disabled unnecessary real-time listeners by default

### 📊 **Firebase Optimizations**
- User-specific queries with `where('userId', '==', user.uid)`
- Extended cache durations (5-30 minutes)
- Debounced search and throttled API calls
- Memory leak prevention with cleanup functions

### 🎨 **UI/UX Optimizations**
- Removed heavy animations for better performance
- Mobile-first responsive design
- Touch-friendly interactive elements
- Loading states and error boundaries

## 📱 Mobile Support

TaskTide is optimized for mobile devices with:
- Responsive grid layouts
- Touch-friendly button sizes (44px+)
- Optimized for Chrome on mobile
- Progressive Web App (PWA) capabilities

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React team for the amazing framework
- Firebase for backend services
- Tailwind CSS for styling system
- All open-source contributors

## 📞 Support

- 📧 Email: support@tasktide.app
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/tasktide/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/tasktide/discussions)

---

**Built with ❤️ for students, by students.**

*TaskTide - Ride the wave of productivity!* 🌊