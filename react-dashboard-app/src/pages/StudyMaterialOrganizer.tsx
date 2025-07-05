import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FolderIcon, 
  DocumentTextIcon, 
  VideoCameraIcon, 
  LinkIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  CalendarDaysIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { doc, collection, addDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useStudyMaterials } from '../hooks/useOptimizedFirestore';
import { cache } from '../utils/cache';

interface StudyMaterial {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'link' | 'note';
  url: string;
  subject: string;
  description?: string;
  createdAt: Timestamp;
  tags: string[];
  userId: string;
}

const StudyMaterialOrganizer: React.FC = () => {
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  
  // Use optimized hook with caching
  const { data: materials, loading, error, refetch } = useStudyMaterials(true);
  
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [saving, setSaving] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    title: '',
    type: 'pdf' as StudyMaterial['type'],
    url: '',
    subject: '',
    description: '',
    tags: [] as string[],
    newTag: ''
  });

  const subjects = [
    'Mathematics',
    'Physics', 
    'Chemistry',
    'Biology',
    'Computer Science',
    'History',
    'English',
    'Psychology',
    'Economics',
    'Art',
    'Other'
  ];

  const materialTypes = [
    { value: 'pdf', label: 'PDF Document', icon: DocumentTextIcon },
    { value: 'video', label: 'Video', icon: VideoCameraIcon },
    { value: 'link', label: 'Web Link', icon: LinkIcon },
    { value: 'note', label: 'Text Note', icon: DocumentTextIcon }
  ];

  // Show error from hook if any
  useEffect(() => {
    if (error) {
      showError(error);
    }
  }, [error, showError]);

  // Save material to Firestore with caching
  const saveMaterial = useCallback(async () => {
    if (!user || !uploadForm.title || !uploadForm.url || !uploadForm.subject) {
      showError('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const materialData = {
        title: uploadForm.title,
        type: uploadForm.type,
        url: uploadForm.url,
        subject: uploadForm.subject,
        description: uploadForm.description,
        tags: uploadForm.tags,
        userId: user.uid,
        createdAt: Timestamp.now()
      };

      await addDoc(collection(db, 'studyMaterials'), materialData);
      
      // Clear cache to force refresh
      cache.delete(`studyMaterials_${user.uid}_${JSON.stringify([])}`);
      
      // Refresh data
      refetch();
      
      setShowUploadModal(false);
      resetForm();
      success('Study material added successfully!');
    } catch (error) {
      console.error('Error saving material:', error);
      showError('Failed to save study material');
    } finally {
      setSaving(false);
    }
  }, [user, uploadForm, showError, success, refetch]);

  // Delete material with caching
  const deleteMaterial = useCallback(async (id: string) => {
    try {
      await deleteDoc(doc(db, 'studyMaterials', id));
      
      // Clear cache to force refresh
      if (user) {
        cache.delete(`studyMaterials_${user.uid}_${JSON.stringify([])}`);
      }
      
      // Refresh data
      refetch();
      success('Material deleted successfully');
    } catch (error) {
      console.error('Error deleting material:', error);
      showError('Failed to delete material');
    }
  }, [user, refetch, success, showError]);

  const resetForm = useCallback(() => {
    setUploadForm({
      title: '',
      type: 'pdf',
      url: '',
      subject: '',
      description: '',
      tags: [],
      newTag: ''
    });
  }, []);

  const addTag = useCallback(() => {
    if (uploadForm.newTag.trim() && !uploadForm.tags.includes(uploadForm.newTag.trim())) {
      setUploadForm(prev => ({
        ...prev,
        tags: [...prev.tags, prev.newTag.trim()],
        newTag: ''
      }));
    }
  }, [uploadForm.newTag, uploadForm.tags]);

  const removeTag = useCallback((tagToRemove: string) => {
    setUploadForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  }, []);

  // Memoized filtered materials for performance
  const filteredMaterials = useMemo(() => {
    return materials.filter(material => {
      const matchesSearch = material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           material.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           material.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesSubject = selectedSubject === 'all' || material.subject === selectedSubject;
      const matchesType = selectedType === 'all' || material.type === selectedType;
      
      return matchesSearch && matchesSubject && matchesType;
    });
  }, [materials, searchTerm, selectedSubject, selectedType]);

  const getTypeIcon = useCallback((type: string) => {
    const typeMap: Record<string, any> = {
      pdf: DocumentTextIcon,
      video: VideoCameraIcon,
      link: LinkIcon,
      note: DocumentTextIcon
    };
    return typeMap[type] || DocumentTextIcon;
  }, []);

  const openMaterial = useCallback((material: StudyMaterial) => {
    window.open(material.url, '_blank');
  }, []);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      success('URL copied to clipboard');
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      success('URL copied to clipboard');
    }
  }, [success]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Study Materials</h1>
            <p className="text-gray-400">Organize and access your study resources</p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <PlusIcon className="w-5 h-5" />
            Add Material
          </button>
        </div>

        {/* Mobile Filters Toggle */}
        <div className="block lg:hidden mb-4">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white hover:bg-black/30 transition-all"
          >
            <AdjustmentsHorizontalIcon className="w-5 h-5" />
            {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        {/* Filters */}
        <div className={`glass rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 ${!showMobileFilters ? 'hidden lg:block' : ''}`}>
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search materials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
              />
            </div>

            {/* Subject Filter */}
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
            >
              <option value="all">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
            >
              <option value="all">All Types</option>
              {materialTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Materials Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <AnimatePresence>
            {filteredMaterials.map((material) => {
              const IconComponent = getTypeIcon(material.type);
              return (
                <motion.div
                  key={material.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="glass rounded-2xl p-4 sm:p-6 hover:shadow-glow transition-all duration-300 group"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="p-2 bg-primary-500/20 rounded-xl flex-shrink-0">
                        <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-primary-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-white font-semibold text-sm sm:text-base line-clamp-1 break-words">{material.title}</h3>
                        <p className="text-xs sm:text-sm text-gray-400">{material.subject}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteMaterial(material.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all flex-shrink-0"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Description */}
                  {material.description && (
                    <p className="text-gray-300 text-xs sm:text-sm mb-4 line-clamp-2 break-words">
                      {material.description}
                    </p>
                  )}

                  {/* Tags */}
                  {material.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 sm:gap-2 mb-4">
                      {material.tags.slice(0, 3).map((tag: string) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-accent-500/20 text-accent-400 text-xs rounded-lg"
                        >
                          {tag}
                        </span>
                      ))}
                      {material.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded-lg">
                          +{material.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Date */}
                  <div className="flex items-center justify-between text-xs sm:text-sm text-gray-400 mb-4">
                    <div className="flex items-center gap-1">
                      <CalendarDaysIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                      {material.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown date'}
                    </div>
                    <span className="capitalize">{material.type}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => openMaterial(material as StudyMaterial)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-primary-500/20 text-primary-400 rounded-xl hover:bg-primary-500/30 transition-all text-xs sm:text-sm"
                    >
                      <EyeIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Open</span>
                    </button>
                    <button
                      onClick={() => copyToClipboard(material.url)}
                      className="px-3 sm:px-4 py-2 bg-white/5 text-gray-400 rounded-xl hover:bg-white/10 transition-all"
                      title="Copy URL"
                    >
                      <ArrowDownTrayIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredMaterials.length === 0 && (
          <div className="text-center py-12">
            <FolderIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No materials found</h3>
            <p className="text-gray-400 mb-6">
              {materials.length === 0 
                ? "Add your first study material to get started" 
                : "Try adjusting your search or filters"}
            </p>
            {materials.length === 0 && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="btn-primary"
              >
                Add Your First Material
              </button>
            )}
          </div>
        )}

        {/* Upload Modal */}
        <AnimatePresence>
          {showUploadModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="glass rounded-3xl p-4 sm:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Add Study Material</h2>
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={uploadForm.title}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-sm sm:text-base"
                      placeholder="Enter material title"
                    />
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Type *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {materialTypes.map((type) => {
                        const IconComponent = type.icon;
                        return (
                          <button
                            key={type.value}
                            onClick={() => setUploadForm(prev => ({ ...prev, type: type.value as StudyMaterial['type'] }))}
                            className={`flex items-center gap-3 p-3 sm:p-4 rounded-xl border transition-all text-sm sm:text-base ${
                              uploadForm.type === type.value
                                ? 'border-primary-500 bg-primary-500/20 text-white'
                                : 'border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
                            }`}
                          >
                            <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="truncate">{type.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      URL/Link *
                    </label>
                    <input
                      type="url"
                      value={uploadForm.url}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, url: e.target.value }))}
                      className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-sm sm:text-base"
                      placeholder="https://example.com/document.pdf"
                    />
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Subject *
                    </label>
                    <select
                      value={uploadForm.subject}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, subject: e.target.value }))}
                      className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-sm sm:text-base"
                    >
                      <option value="">Select subject</option>
                      {subjects.map(subject => (
                        <option key={subject} value={subject}>{subject}</option>
                      ))}
                    </select>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={uploadForm.description}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all resize-none text-sm sm:text-base"
                      rows={3}
                      placeholder="Brief description of the material"
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tags
                    </label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={uploadForm.newTag}
                        onChange={(e) => setUploadForm(prev => ({ ...prev, newTag: e.target.value }))}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        className="flex-1 px-4 py-2 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-sm sm:text-base"
                        placeholder="Add a tag"
                      />
                      <button
                        type="button"
                        onClick={addTag}
                        className="px-3 sm:px-4 py-2 bg-primary-500/20 text-primary-400 rounded-xl hover:bg-primary-500/30 transition-all text-sm sm:text-base whitespace-nowrap"
                      >
                        Add
                      </button>
                    </div>
                    {uploadForm.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {uploadForm.tags.map((tag: string) => (
                          <span
                            key={tag}
                            className="flex items-center gap-2 px-3 py-1 bg-accent-500/20 text-accent-400 rounded-lg text-sm"
                          >
                            <span className="truncate max-w-[100px]">{tag}</span>
                            <button
                              onClick={() => removeTag(tag)}
                              className="text-accent-400 hover:text-accent-300 flex-shrink-0"
                            >
                              <XMarkIcon className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button
                      onClick={() => setShowUploadModal(false)}
                      className="flex-1 px-6 py-3 border border-white/10 text-gray-400 rounded-xl hover:border-white/20 hover:text-white transition-all text-sm sm:text-base"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveMaterial}
                      disabled={saving || !uploadForm.title || !uploadForm.url || !uploadForm.subject}
                      className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                    >
                      {saving ? 'Saving...' : 'Save Material'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StudyMaterialOrganizer;
