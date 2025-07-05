import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { PlusIcon, TrashIcon, BookOpenIcon, TrophyIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { toast } from 'react-hot-toast';

interface Grade {
  id: string;
  subject: string;
  assignment: string;
  grade: number;
  maxGrade: number;
  date: string;
  type: 'exam' | 'assignment' | 'quiz' | 'project';
}

const GradeTracker: React.FC = () => {
  const { user } = useAuth();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingGrade, setIsAddingGrade] = useState(false);
  const [newGrade, setNewGrade] = useState<{
    subject: string;
    assignment: string;
    grade: string;
    maxGrade: string;
    date: string;
    type: 'exam' | 'assignment' | 'quiz' | 'project';
  }>({
    subject: '',
    assignment: '',
    grade: '',
    maxGrade: '',
    date: '',
    type: 'assignment'
  });
  const [selectedSubject, setSelectedSubject] = useState('all');

  useEffect(() => {
    if (user) {
      fetchGrades();
    }
  }, [user]);

  const fetchGrades = async () => {
    if (!user) return;

    try {
      const gradesQuery = query(
        collection(db, 'grades'),
        where('userId', '==', user.uid),
        orderBy('date', 'desc')
      );
      const snapshot = await getDocs(gradesQuery);
      const gradesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Grade[];
      setGrades(gradesData);
    } catch (error) {
      console.error('Error fetching grades:', error);
      toast.error('Failed to fetch grades');
    } finally {
      setLoading(false);
    }
  };

  const addGrade = async () => {
    if (!user || !newGrade.subject || !newGrade.assignment || !newGrade.grade || !newGrade.maxGrade || !newGrade.date) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const gradeData = {
        subject: newGrade.subject,
        assignment: newGrade.assignment,
        grade: parseFloat(newGrade.grade),
        maxGrade: parseFloat(newGrade.maxGrade),
        date: newGrade.date,
        type: newGrade.type,
        userId: user.uid,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'grades'), gradeData);
      toast.success('Grade added successfully');
      setNewGrade({
        subject: '',
        assignment: '',
        grade: '',
        maxGrade: '',
        date: '',
        type: 'assignment'
      });
      setIsAddingGrade(false);
      fetchGrades();
    } catch (error) {
      console.error('Error adding grade:', error);
      toast.error('Failed to add grade');
    }
  };

  const deleteGrade = async (gradeId: string) => {
    if (!user) return;

    try {
      await deleteDoc(doc(db, 'grades', gradeId));
      toast.success('Grade deleted successfully');
      fetchGrades();
    } catch (error) {
      console.error('Error deleting grade:', error);
      toast.error('Failed to delete grade');
    }
  };

  const getSubjects = () => {
    const subjects = [...new Set(grades.map(grade => grade.subject))];
    return subjects.sort();
  };

  const getFilteredGrades = () => {
    if (selectedSubject === 'all') return grades;
    return grades.filter(grade => grade.subject === selectedSubject);
  };

  const calculateGPA = (filteredGrades: Grade[]) => {
    if (filteredGrades.length === 0) return 0;
    const totalPercentage = filteredGrades.reduce((sum, grade) => sum + (grade.grade / grade.maxGrade) * 100, 0);
    return (totalPercentage / filteredGrades.length / 25).toFixed(2); // Convert to 4.0 scale
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  const filteredGrades = getFilteredGrades();
  const gpa = calculateGPA(filteredGrades);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
          <TrophyIcon className="w-8 h-8 mr-3 text-yellow-500" />
          Grade Tracker
        </h1>
        <button
          onClick={() => setIsAddingGrade(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Grade
        </button>
      </div>

      {/* GPA Display */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Current GPA</p>
            <p className="text-3xl font-bold text-blue-600">{gpa}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Grades</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{filteredGrades.length}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Average Score</p>
            <p className="text-3xl font-bold text-green-600">
              {filteredGrades.length > 0 
                ? `${(filteredGrades.reduce((sum, grade) => sum + (grade.grade / grade.maxGrade) * 100, 0) / filteredGrades.length).toFixed(1)}%`
                : '0%'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex space-x-4">
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="all">All Subjects</option>
          {getSubjects().map(subject => (
            <option key={subject} value={subject}>{subject}</option>
          ))}
        </select>
      </div>

      {/* Grades List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        {filteredGrades.length === 0 ? (
          <div className="p-8 text-center">
            <BookOpenIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No grades found. Add your first grade to get started!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Assignment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Grade</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Percentage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredGrades.map((grade) => {
                  const percentage = (grade.grade / grade.maxGrade) * 100;
                  return (
                    <tr key={grade.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{grade.subject}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{grade.assignment}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{grade.grade}/{grade.maxGrade}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${getGradeColor(percentage)}`}>
                        {percentage.toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">{grade.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{grade.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => deleteGrade(grade.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Grade Modal */}
      {isAddingGrade && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Add New Grade</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Subject"
                value={newGrade.subject}
                onChange={(e) => setNewGrade({...newGrade, subject: e.target.value})}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <input
                type="text"
                placeholder="Assignment/Exam Name"
                value={newGrade.assignment}
                onChange={(e) => setNewGrade({...newGrade, assignment: e.target.value})}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Grade"
                  value={newGrade.grade}
                  onChange={(e) => setNewGrade({...newGrade, grade: e.target.value})}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <input
                  type="number"
                  placeholder="Max Grade"
                  value={newGrade.maxGrade}
                  onChange={(e) => setNewGrade({...newGrade, maxGrade: e.target.value})}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <select
                value={newGrade.type}
                onChange={(e) => setNewGrade({...newGrade, type: e.target.value as 'exam' | 'assignment' | 'quiz' | 'project'})}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="assignment">Assignment</option>
                <option value="exam">Exam</option>
                <option value="quiz">Quiz</option>
                <option value="project">Project</option>
              </select>
              <input
                type="date"
                value={newGrade.date}
                onChange={(e) => setNewGrade({...newGrade, date: e.target.value})}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setIsAddingGrade(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={addGrade}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Add Grade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GradeTracker;
