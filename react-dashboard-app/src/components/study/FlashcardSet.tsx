import React, { useState, useEffect } from 'react';
import { RotateCcw, ChevronLeft, ChevronRight, Plus, Edit3, Trash2, BookOpen, Target, CheckCircle, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../ui/Toast';
import Modal from '../ui/Modal';
import { motion, AnimatePresence } from 'framer-motion';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  lastReviewed?: Date;
  confidence: number;
  createdAt: Date;
}

interface FlashcardSetProps {
  subject?: string;
  onClose?: () => void;
}

const FlashcardSet: React.FC<FlashcardSetProps> = ({ subject, onClose }) => {
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studyMode, setStudyMode] = useState<'create' | 'study' | 'review'>('study');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCard, setNewCard] = useState({
    front: '',
    back: '',
    subject: subject || '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard'
  });

  // Sample flashcards for demo
  useEffect(() => {
    const sampleCards: Flashcard[] = [
      {
        id: '1',
        front: 'What is the time complexity of binary search?',
        back: 'O(log n) - Binary search eliminates half of the remaining elements in each iteration.',
        subject: 'Computer Science',
        difficulty: 'medium',
        confidence: 0.7,
        createdAt: new Date()
      },
      {
        id: '2',
        front: 'Define photosynthesis',
        back: 'The process by which plants use sunlight, carbon dioxide, and water to create glucose and oxygen.',
        subject: 'Biology',
        difficulty: 'easy',
        confidence: 0.9,
        createdAt: new Date()
      },
      {
        id: '3',
        front: 'What is the derivative of sin(x)?',
        back: 'cos(x) - The derivative of sine function is cosine function.',
        subject: 'Mathematics',
        difficulty: 'medium',
        confidence: 0.5,
        createdAt: new Date()
      },
      {
        id: '4',
        front: 'Who wrote "To Kill a Mockingbird"?',
        back: 'Harper Lee - Published in 1960, it won the Pulitzer Prize for Fiction.',
        subject: 'Literature',
        difficulty: 'easy',
        confidence: 0.8,
        createdAt: new Date()
      },
      {
        id: '5',
        front: 'What is Newton\'s Second Law of Motion?',
        back: 'F = ma - Force equals mass times acceleration.',
        subject: 'Physics',
        difficulty: 'medium',
        confidence: 0.6,
        createdAt: new Date()
      }
    ];
    
    const filteredCards = subject 
      ? sampleCards.filter(card => card.subject === subject)
      : sampleCards;
    
    setFlashcards(filteredCards);
  }, [subject]);

  const currentCard = flashcards[currentIndex];

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  };

  const handleConfidenceUpdate = (confidence: number) => {
    setFlashcards(prev => prev.map(card => 
      card.id === currentCard.id 
        ? { ...card, confidence, lastReviewed: new Date() }
        : card
    ));
    success('Progress Saved!', `Confidence updated for this card`);
    
    // Auto-advance to next card
    setTimeout(() => {
      handleNext();
    }, 1000);
  };

  const handleCreateCard = () => {
    if (!newCard.front.trim() || !newCard.back.trim()) {
      showError('Error', 'Please fill in both front and back of the card');
      return;
    }

    const card: Flashcard = {
      id: Date.now().toString(),
      ...newCard,
      confidence: 0.5,
      createdAt: new Date()
    };

    setFlashcards(prev => [...prev, card]);
    setNewCard({ front: '', back: '', subject: subject || '', difficulty: 'medium' });
    setShowCreateModal(false);
    success('Success!', 'Flashcard created successfully');
  };

  if (!currentCard && flashcards.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-900 dark:to-pink-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="glass rounded-3xl p-8 text-center">
            <BookOpen className="w-16 h-16 text-purple-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No Flashcards Yet
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Create your first flashcard to start studying!
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Flashcard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-900 dark:to-pink-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-white/10 transition-colors"
              >
                <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              </button>
            )}
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Flashcards
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                {subject ? `${subject} • ` : ''}{flashcards.length} cards
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-secondary"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Card
            </button>
          </div>
        </div>

        {currentCard && (
          <>
            {/* Progress */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Card {currentIndex + 1} of {flashcards.length}
                </span>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Confidence: {Math.round(currentCard.confidence * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Flashcard */}
            <div className="mb-8">
              <div 
                className={`relative w-full h-80 cursor-pointer transition-transform duration-700 preserve-3d ${
                  isFlipped ? 'rotate-y-180' : ''
                }`}
                onClick={() => setIsFlipped(!isFlipped)}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Front */}
                <div className="absolute inset-0 glass rounded-3xl p-8 backface-hidden flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Question
                    </h3>
                    <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                      {currentCard.front}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                      Click to reveal answer
                    </p>
                  </div>
                </div>

                {/* Back */}
                <div 
                  className="absolute inset-0 glass rounded-3xl p-8 backface-hidden rotate-y-180 flex items-center justify-center"
                  style={{ transform: 'rotateY(180deg)' }}
                >
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Answer
                    </h3>
                    <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                      {currentCard.back}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation and Confidence */}
            <div className="space-y-6">
              {/* Navigation */}
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  className={`p-3 rounded-2xl transition-all duration-200 ${
                    currentIndex === 0
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:scale-105 shadow-lg'
                  }`}
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="p-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-105 transition-transform duration-200"
                >
                  <RotateCcw className="w-6 h-6" />
                </button>

                <button
                  onClick={handleNext}
                  disabled={currentIndex === flashcards.length - 1}
                  className={`p-3 rounded-2xl transition-all duration-200 ${
                    currentIndex === flashcards.length - 1
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:scale-105 shadow-lg'
                  }`}
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              {/* Confidence Rating */}
              {isFlipped && (
                <div className="glass rounded-2xl p-6" data-aos="fade-up">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
                    How confident are you with this answer?
                  </h4>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => handleConfidenceUpdate(0.3)}
                      className="px-6 py-3 rounded-xl bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 hover:scale-105 transition-transform duration-200"
                    >
                      😕 Hard
                    </button>
                    <button
                      onClick={() => handleConfidenceUpdate(0.6)}
                      className="px-6 py-3 rounded-xl bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 hover:scale-105 transition-transform duration-200"
                    >
                      🤔 Medium
                    </button>
                    <button
                      onClick={() => handleConfidenceUpdate(0.9)}
                      className="px-6 py-3 rounded-xl bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 hover:scale-105 transition-transform duration-200"
                    >
                      😊 Easy
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Create Card Modal */}
        <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)}>
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Create New Flashcard
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Question (Front)
                </label>
                <textarea
                  value={newCard.front}
                  onChange={(e) => setNewCard(prev => ({ ...prev, front: e.target.value }))}
                  placeholder="Enter your question..."
                  className="input-field h-24 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Answer (Back)
                </label>
                <textarea
                  value={newCard.back}
                  onChange={(e) => setNewCard(prev => ({ ...prev, back: e.target.value }))}
                  placeholder="Enter the answer..."
                  className="input-field h-24 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={newCard.subject}
                    onChange={(e) => setNewCard(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="e.g., Mathematics"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Difficulty
                  </label>
                  <select
                    value={newCard.difficulty}
                    onChange={(e) => setNewCard(prev => ({ ...prev, difficulty: e.target.value as any }))}
                    className="input-field"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCard}
                className="btn-primary"
              >
                Create Card
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default FlashcardSet;
