import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import useAuth from '../hooks/useAuth';
import { Task } from '../types';
import { getUserTasks } from '../services/firestore';
import { PlusIcon, CalendarIcon } from 'lucide-react';

const Calendar: React.FC = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadTasks();
        }
    }, [user]);

    const loadTasks = async () => {
        try {
            setLoading(true);
            const userTasks = await getUserTasks(user!.uid);
            setTasks(userTasks);
        } catch (error) {
            console.error('Error loading tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    // Convert tasks to calendar events
    const calendarEvents = tasks
        .filter(task => task.deadline)
        .map(task => ({
            id: task.id,
            title: task.title,
            date: task.deadline!.toISOString().split('T')[0],
            backgroundColor: getPriorityColor(task.priority),
            borderColor: getPriorityColor(task.priority),
            extendedProps: {
                task: task
            }
        }));

    function getPriorityColor(priority: string) {
        switch (priority) {
            case 'high': return '#ef4444';
            case 'medium': return '#f59e0b';
            case 'low': return '#10b981';
            default: return '#6b7280';
        }
    }

    const handleEventClick = (clickInfo: any) => {
        const task = clickInfo.event.extendedProps.task;
        alert(`Task: ${task.title}\nSubject: ${task.subject}\nPriority: ${task.priority}\nStatus: ${task.status}`);
    };

    const handleDateClick = (arg: any) => {
        const selectedDate = arg.dateStr;
        console.log('Selected date:', selectedDate);
        // You can add logic here to create a new task for this date
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
                    <p className="text-gray-600 mt-1">View your tasks and deadlines</p>
                </div>
                <div className="flex space-x-3">
                    <div className="flex items-center space-x-2 text-sm">
                        <div className="w-3 h-3 bg-red-500 rounded"></div>
                        <span>High Priority</span>
                        <div className="w-3 h-3 bg-yellow-500 rounded ml-4"></div>
                        <span>Medium Priority</span>
                        <div className="w-3 h-3 bg-green-500 rounded ml-4"></div>
                        <span>Low Priority</span>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <CalendarIcon className="w-8 h-8 text-blue-600" />
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-500">Total Tasks</p>
                            <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <CalendarIcon className="w-8 h-8 text-orange-600" />
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-500">With Deadlines</p>
                            <p className="text-2xl font-bold text-gray-900">{tasks.filter(t => t.deadline).length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <CalendarIcon className="w-8 h-8 text-red-600" />
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-500">Overdue</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {tasks.filter(t => t.deadline && new Date(t.deadline) < new Date() && t.status !== 'completed').length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Calendar */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <FullCalendar
                    plugins={[dayGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    events={calendarEvents}
                    eventClick={handleEventClick}
                    dateClick={handleDateClick}
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth'
                    }}
                    height="auto"
                    eventDisplay="block"
                    dayMaxEvents={3}
                    moreLinkClick="day"
                />
            </div>

            {/* Upcoming Tasks */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold mb-4">Upcoming Deadlines</h3>
                <div className="space-y-3">
                    {tasks
                        .filter(task => task.deadline && new Date(task.deadline) >= new Date())
                        .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
                        .slice(0, 5)
                        .map(task => (
                            <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <h4 className="font-medium text-gray-900">{task.title}</h4>
                                    <p className="text-sm text-gray-600">{task.subject}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-900">
                                        {task.deadline!.toLocaleDateString()}
                                    </p>
                                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                                        task.priority === 'high' ? 'bg-red-100 text-red-800' :
                                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-green-100 text-green-800'
                                    }`}>
                                        {task.priority}
                                    </span>
                                </div>
                            </div>
                        ))}
                    {tasks.filter(task => task.deadline && new Date(task.deadline) >= new Date()).length === 0 && (
                        <p className="text-gray-500 text-center py-4">No upcoming deadlines</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Calendar;