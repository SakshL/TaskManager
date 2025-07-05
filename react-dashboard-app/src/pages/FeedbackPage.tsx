import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { 
  ChatBubbleLeftRightIcon, 
  ExclamationTriangleIcon, 
  CameraIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import html2canvas from 'html2canvas';

interface FeedbackData {
  type: 'bug' | 'feature' | 'general';
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  screenshot?: string;
}

const FeedbackPage: React.FC = () => {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState<FeedbackData>({
    type: 'general',
    subject: '',
    description: '',
    priority: 'medium'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [screenshot, setScreenshot] = useState<string | null>(null);

  const handleInputChange = (field: keyof FeedbackData, value: string) => {
    setFeedback(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const captureScreenshot = async () => {
    try {
      const canvas = await html2canvas(document.body, {
        height: window.innerHeight,
        width: window.innerWidth,
        scrollX: 0,
        scrollY: 0
      });
      const dataURL = canvas.toDataURL('image/png');
      setScreenshot(dataURL);
      setFeedback(prev => ({
        ...prev,
        screenshot: dataURL
      }));
      toast.success('Screenshot captured!');
    } catch (error) {
      console.error('Error capturing screenshot:', error);
      toast.error('Failed to capture screenshot');
    }
  };

  const submitFeedback = async () => {
    if (!user) {
      toast.error('Please login to submit feedback');
      return;
    }

    if (!feedback.subject.trim() || !feedback.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const feedbackData = {
        ...feedback,
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || 'Anonymous',
        timestamp: new Date().toISOString(),
        status: 'open',
        createdAt: new Date()
      };

      await addDoc(collection(db, 'feedback'), feedbackData);
      toast.success('Feedback submitted successfully! Thank you for your input.');
      
      // Reset form
      setFeedback({
        type: 'general',
        subject: '',
        description: '',
        priority: 'medium'
      });
      setScreenshot(null);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFeedbackTypeIcon = (type: string) => {
    switch (type) {
      case 'bug':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
      case 'feature':
        return <ChatBubbleLeftRightIcon className="w-5 h-5 text-blue-500" />;
      default:
        return <ChatBubbleLeftRightIcon className="w-5 h-5 text-green-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-center">
          <ChatBubbleLeftRightIcon className="w-8 h-8 mr-3 text-blue-600" />
          Feedback & Bug Report
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Help us improve TaskTide! Report bugs, suggest features, or share your general feedback. 
          Your input is valuable to us.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="space-y-6">
          {/* Feedback Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Feedback Type
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { value: 'bug', label: 'Bug Report', desc: 'Something is broken or not working' },
                { value: 'feature', label: 'Feature Request', desc: 'Suggest a new feature or improvement' },
                { value: 'general', label: 'General Feedback', desc: 'Share your thoughts or experience' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleInputChange('type', option.value)}
                  className={`p-4 border-2 rounded-lg text-left transition-colors ${
                    feedback.type === option.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center mb-2">
                    {getFeedbackTypeIcon(option.value)}
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      {option.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{option.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Priority
            </label>
            <select
              value={feedback.priority}
              onChange={(e) => handleInputChange('priority', e.target.value)}
              className="w-full md:w-48 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <div className="mt-2">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(feedback.priority)}`}>
                {feedback.priority.charAt(0).toUpperCase() + feedback.priority.slice(1)} Priority
              </span>
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subject *
            </label>
            <input
              type="text"
              value={feedback.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              placeholder="Brief summary of your feedback"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              value={feedback.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder={
                feedback.type === 'bug'
                  ? 'Please describe the bug, including steps to reproduce it...'
                  : feedback.type === 'feature'
                  ? 'Describe the feature you would like to see...'
                  : 'Share your feedback, thoughts, or suggestions...'
              }
              rows={6}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 resize-vertical"
              required
            />
          </div>

          {/* Screenshot */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Screenshot (Optional)
            </label>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={captureScreenshot}
                className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <CameraIcon className="w-5 h-5 mr-2" />
                Capture Screenshot
              </button>
              {screenshot && (
                <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                  <span>Screenshot captured</span>
                  <button
                    onClick={() => {
                      setScreenshot(null);
                      setFeedback(prev => ({ ...prev, screenshot: undefined }));
                    }}
                    className="ml-2 text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
            {screenshot && (
              <div className="mt-4">
                <img
                  src={screenshot}
                  alt="Screenshot"
                  className="max-w-full h-auto max-h-64 rounded-lg border border-gray-200 dark:border-gray-600"
                />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={submitFeedback}
              disabled={isSubmitting || !feedback.subject.trim() || !feedback.description.trim()}
              className="flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <PaperAirplaneIcon className="w-5 h-5 mr-2" />
                  Submit Feedback
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Tips for effective feedback:</h3>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Be specific and descriptive in your subject line</li>
          <li>• For bugs: Include steps to reproduce the issue</li>
          <li>• For features: Explain how it would benefit your workflow</li>
          <li>• Screenshots help us understand visual issues better</li>
          <li>• We review all feedback and will respond when possible</li>
        </ul>
      </div>
    </div>
  );
};

export default FeedbackPage;
