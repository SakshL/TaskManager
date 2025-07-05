// Firebase Email Verification Handler for TaskTide
// Modern ES Module implementation with Tailwind CSS styling

// Firebase SDK imports (ES Module syntax)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
  getAuth, 
  applyActionCode, 
  checkActionCode,
  ActionCodeOperation 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Firebase configuration - Your actual TaskTide config
const firebaseConfig = {
  apiKey: "AIzaSyDNdyln3e3zfRtMs8gRwpnCDwyVnB80w3o",
  authDomain: "studentmanagerr-632e5.firebaseapp.com",
  projectId: "studentmanagerr-632e5",
  storageBucket: "studentmanagerr-632e5.firebasestorage.app",
  messagingSenderId: "1067720396369",
  appId: "1:1067720396369:web:bc0489cf45ee5960667270",
  measurementId: "G-PZNY9B4Y2T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Utility function to extract URL parameters
function getParameterByName(name, url = window.location.href) {
  const cleanName = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp('[?&]' + cleanName + '(=([^&#]*)|&|#|$)');
  const results = regex.exec(url);
  
  if (!results) return null;
  if (!results[2]) return '';
  
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

// Enhanced message display with beautiful Tailwind styling and animations
function displayMessage(type, message, showSpinner = false) {
  const messageElement = document.getElementById('message');
  
  if (!messageElement) {
    console.error('Message element not found');
    return;
  }

  // Remove existing classes
  messageElement.className = '';
  
  // Base classes for all messages
  const baseClasses = [
    'text-lg', 'font-semibold', 'text-center', 'p-6', 'rounded-xl', 
    'border-2', 'transition-all', 'duration-500', 'ease-in-out',
    'transform', 'shadow-lg', 'backdrop-blur-sm'
  ];

  // Type-specific styling
  const typeClasses = {
    success: [
      'text-emerald-800', 'bg-gradient-to-r', 'from-emerald-50', 'to-green-50',
      'border-emerald-300', 'shadow-emerald-200/50'
    ],
    error: [
      'text-red-800', 'bg-gradient-to-r', 'from-red-50', 'to-pink-50',
      'border-red-300', 'shadow-red-200/50'
    ],
    loading: [
      'text-blue-800', 'bg-gradient-to-r', 'from-blue-50', 'to-indigo-50',
      'border-blue-300', 'shadow-blue-200/50'
    ]
  };

  // Apply classes
  messageElement.className = [...baseClasses, ...(typeClasses[type] || typeClasses.error)].join(' ');
  
  // Create message content with optional spinner
  let messageHTML = '';
  
  if (showSpinner) {
    messageHTML = `
      <div class="flex items-center justify-center gap-3 mb-3">
        <div class="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
        <span class="text-blue-700 font-medium">Processing verification...</span>
      </div>
    `;
  }
  
  // Add icon based on type
  const icons = {
    success: '✅',
    error: '❌',
    loading: '🔄'
  };
  
  messageHTML += `
    <div class="flex items-center justify-center gap-3 mb-3">
      <span class="text-3xl">${icons[type] || icons.error}</span>
      <span class="text-xl font-bold ${type === 'success' ? 'text-emerald-700' : type === 'error' ? 'text-red-700' : 'text-blue-700'}">
        ${type === 'success' ? 'Success!' : type === 'error' ? 'Verification Failed' : 'Verifying...'}
      </span>
    </div>
    <p class="leading-relaxed">${message}</p>
  `;
  
  messageElement.innerHTML = messageHTML;
  
  // Trigger fade-in animation
  messageElement.style.opacity = '0';
  messageElement.style.transform = 'translateY(20px)';
  
  setTimeout(() => {
    messageElement.style.opacity = '1';
    messageElement.style.transform = 'translateY(0)';
  }, 100);
}

// Enhanced continue link with beautiful styling
function displayContinueLink(continueUrl) {
  const continueLinkElement = document.getElementById('continue-link');
  
  if (!continueLinkElement || !continueUrl) return;
  
  const linkHTML = `
    <div class="mt-6 text-center">
      <a href="${continueUrl}" 
         class="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
        <span>🚀</span>
        <span>Return to TaskTide</span>
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
        </svg>
      </a>
      <p class="mt-3 text-sm text-gray-600">
        You can safely close this window or click above to continue using TaskTide.
      </p>
    </div>
  `;
  
  continueLinkElement.innerHTML = linkHTML;
  
  // Animate the continue link appearance
  setTimeout(() => {
    continueLinkElement.style.opacity = '0';
    continueLinkElement.style.transform = 'translateY(20px)';
    continueLinkElement.style.transition = 'all 0.5s ease-in-out';
    
    setTimeout(() => {
      continueLinkElement.style.opacity = '1';
      continueLinkElement.style.transform = 'translateY(0)';
    }, 200);
  }, 1000);
}

// Enhanced email verification handler with detailed feedback
async function handleEmailVerification(actionCode, continueUrl) {
  try {
    // Show loading state
    displayMessage('loading', 'Verifying your email address...', true);
    
    // First, check the action code to get additional info
    const info = await checkActionCode(auth, actionCode);
    
    // Apply the action code to verify the email
    await applyActionCode(auth, actionCode);
    
    // Success! Display success message
    const successMessage = `
      <strong>Your email address has been successfully verified!</strong><br><br>
      Welcome to TaskTide! Your account is now fully activated and you can access all features.<br><br>
      <span class="text-emerald-600 font-medium">🎉 You're all set to boost your productivity!</span>
    `;
    
    displayMessage('success', successMessage);
    
    // Display continue link if available
    if (continueUrl) {
      displayContinueLink(continueUrl);
    } else {
      // Default continue link to app
      displayContinueLink('https://tasktide.rocks/dashboard');
    }
    
    // Add confetti effect for success (optional visual enhancement)
    setTimeout(() => {
      createConfettiEffect();
    }, 1500);
    
  } catch (error) {
    console.error('Email verification error:', error);
    
    let errorMessage = `
      <strong>Oops! The verification link is invalid or has expired.</strong><br><br>
      This can happen if:<br>
      • The link has already been used<br>
      • The link has expired (links expire after 24 hours)<br>
      • The link was corrupted during copying<br><br>
      <span class="text-red-600 font-medium">Please try requesting a new verification email from the TaskTide app.</span>
    `;
    
    // Customize error message based on error code
    if (error.code === 'auth/expired-action-code') {
      errorMessage = `
        <strong>This verification link has expired.</strong><br><br>
        Verification links expire after 24 hours for security reasons.<br><br>
        <span class="text-red-600 font-medium">Please request a new verification email from TaskTide.</span>
      `;
    } else if (error.code === 'auth/invalid-action-code') {
      errorMessage = `
        <strong>This verification link is invalid.</strong><br><br>
        The link may have been corrupted or already used.<br><br>
        <span class="text-red-600 font-medium">Please request a new verification email from TaskTide.</span>
      `;
    } else if (error.code === 'auth/user-disabled') {
      errorMessage = `
        <strong>Account access has been disabled.</strong><br><br>
        Please contact TaskTide support for assistance.<br><br>
        <span class="text-red-600 font-medium">Email: support@tasktide.rocks</span>
      `;
    }
    
    displayMessage('error', errorMessage);
    
    // Add support link for errors
    setTimeout(() => {
      const continueLinkElement = document.getElementById('continue-link');
      if (continueLinkElement) {
        continueLinkElement.innerHTML = `
          <div class="mt-6 text-center space-y-3">
            <a href="https://tasktide.rocks/login" 
               class="inline-flex items-center gap-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300">
              <span>🔄</span>
              <span>Try Again</span>
            </a>
            <br>
            <a href="mailto:support@tasktide.rocks" 
               class="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors duration-300">
              <span>📧</span>
              <span>Contact Support</span>
            </a>
          </div>
        `;
      }
    }, 1000);
  }
}

// Fun confetti effect for successful verification
function createConfettiEffect() {
  const colors = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'];
  const confettiCount = 50;
  
  for (let i = 0; i < confettiCount; i++) {
    setTimeout(() => {
      const confetti = document.createElement('div');
      confetti.style.cssText = `
        position: fixed;
        top: -10px;
        left: ${Math.random() * 100}vw;
        width: 10px;
        height: 10px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        border-radius: 50%;
        pointer-events: none;
        z-index: 1000;
        animation: confetti-fall 3s linear forwards;
      `;
      
      document.body.appendChild(confetti);
      
      setTimeout(() => confetti.remove(), 3000);
    }, i * 50);
  }
}

// Add confetti animation CSS
const style = document.createElement('style');
style.textContent = `
  @keyframes confetti-fall {
    0% {
      transform: translateY(-100px) rotate(0deg);
      opacity: 1;
    }
    100% {
      transform: translateY(100vh) rotate(720deg);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Main execution function
function handleEmailAction() {
  // Extract URL parameters
  const mode = getParameterByName('mode');
  const actionCode = getParameterByName('oobCode');
  const continueUrl = getParameterByName('continueUrl');
  
  // Log for debugging (remove in production)
  console.log('Email verification handler loaded:', { mode, actionCode: actionCode ? 'present' : 'missing', continueUrl });
  
  // Handle different action modes
  if (mode === 'verifyEmail' && actionCode) {
    handleEmailVerification(actionCode, continueUrl);
  } else if (mode === 'resetPassword') {
    displayMessage('error', `
      <strong>Password Reset Link Detected</strong><br><br>
      This appears to be a password reset link, not an email verification link.<br><br>
      <span class="text-blue-600 font-medium">Please use this link in the TaskTide login page.</span>
    `);
  } else if (mode === 'recoverEmail') {
    displayMessage('error', `
      <strong>Email Recovery Link Detected</strong><br><br>
      This appears to be an email recovery link, not an email verification link.<br><br>
      <span class="text-blue-600 font-medium">Please use this link in the TaskTide account settings.</span>
    `);
  } else {
    displayMessage('error', `
      <strong>Invalid Verification Link</strong><br><br>
      This link appears to be malformed or missing required parameters.<br><br>
      <span class="text-red-600 font-medium">Please request a new verification email from TaskTide.</span>
    `);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', handleEmailAction);
} else {
  handleEmailAction();
}

// Export for potential external use
export { handleEmailAction, getParameterByName };
