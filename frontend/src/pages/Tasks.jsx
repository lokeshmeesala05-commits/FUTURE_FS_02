import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api';
import { Plus, Search, Filter, X, CheckCircle, Clock, AlertCircle, Calendar, User, Tag } from 'lucide-react';

const PRIORITY_COLORS = {
  'High': 'bg-red-100 text-red-800 border-red-200',
  'Medium': 'bg-orange-100 text-orange-800 border-orange-200',
  'Low': 'bg-gray-100 text-gray-800 border-gray-200',
};

const STATUS_COLORS = {
  'Pending': 'bg-yellow-50 text-yellow-700',
  'In Progress': 'bg-blue-50 text-blue-700',
  'Completed': 'bg-green-50 text-green-700',
  'Cancelled': 'bg-gray-50 text-gray-500',
};

const Tasks = () => {
  const location = useLocation();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'Medium',
    relatedType: 'None',
    relatedId: ''
  });

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/tasks');
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();

    // Handle query params for pre-filling
    const params = new URLSearchParams(location.search);
    const relatedType = params.get('relatedType');
    const relatedId = params.get('relatedId');
    const title = params.get('title');

    if (relatedType || title) {
      setFormData({
        title: title || '',
        description: '',
        dueDate: new Date().toISOString().split('T')[0],
        priority: 'Medium',
        relatedType: relatedType || 'None',
        relatedId: relatedId || ''
      });
      setIsModalOpen(true);
    }
  }, [location]);

  const handleOpenModal = (task = null) => {
    if (task) {
      setFormData({
        id: task.id,
        title: task.title,
        description: task.description || '',
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        priority: task.priority,
        relatedType: task.relatedType,
        relatedId: task.relatedId || '',
        status: task.status
      });
    } else {
      setFormData({
        title: '',
        description: '',
        dueDate: '',
        priority: 'Medium',
        relatedType: 'None',
        relatedId: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Sanitize formData
      const submissionData = { ...formData };
      if (!submissionData.relatedId || submissionData.relatedId === '') {
        submissionData.relatedId = null;
      } else {
        submissionData.relatedId = parseInt(submissionData.relatedId);
      }
      
      if (submissionData.relatedType === 'None') {
        submissionData.relatedId = null;
      }

      if (formData.id) {
        await api.put(`/tasks/${formData.id}`, submissionData);
        alert('Task updated successfully!');
      } else {
        await api.post('/tasks', submissionData);
        alert('Task created successfully!');
      }
      setIsModalOpen(false);
      fetchTasks();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to save task. Please check all fields.');
    }
  };

  const toggleTaskStatus = async (task) => {
    try {
      const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
      await api.put(`/tasks/${task.id}`, { status: newStatus });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === 'All' || task.priority === filterPriority;
    const matchesStatus = filterStatus === 'All' || task.status === filterStatus;
    return matchesSearch && matchesPriority && matchesStatus;
  });

  if (loading) return <div className="p-8 text-center text-gray-500">Loading tasks...</div>;

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Tasks &amp; Follow-ups</h1>
          <p className="text-sm text-gray-500">Stay organized and never miss a meeting.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="self-start sm:self-auto bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition shadow-sm"
        >
          <Plus size={20} />
          <span>Add Task</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search tasks..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <select 
            className="flex-1 sm:flex-none border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="All">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>
          <select 
            className="flex-1 sm:flex-none border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden text-sm">
        <div className="divide-y divide-gray-100">
          {filteredTasks.map(task => {
            const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'Completed';
            return (
              <div key={task.id} className="p-4 hover:bg-gray-50 flex items-center gap-4 transition group">
                <button 
                  onClick={() => toggleTaskStatus(task)}
                  className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
                    task.status === 'Completed' 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : 'border-gray-300 text-transparent hover:border-gray-400'
                  }`}
                >
                  <CheckCircle size={16} />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-semibold truncate ${task.status === 'Completed' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                      {task.title}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${PRIORITY_COLORS[task.priority]}`}>
                      {task.priority}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-gray-500 text-xs">
                    <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-600 font-medium' : ''}`}>
                      <Calendar size={14} />
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                      {isOverdue && ' (Overdue)'}
                    </span>
                    {task.relatedType !== 'None' && (
                      <span className="flex items-center gap-1">
                        <Tag size={14} />
                        {task.relatedType}: {task.relatedId}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition">
                  <button 
                    onClick={() => handleOpenModal(task)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 rounded-md hover:bg-blue-50"
                  >
                    Edit
                  </button>
                </div>
              </div>
            );
          })}
          {filteredTasks.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              <CheckCircle className="mx-auto mb-4 text-gray-200" size={48} />
              <p>No tasks found. Relax, you're all caught up!</p>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">{formData.id ? 'Edit Task' : 'New Task'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Title *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Call client for feedback"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                />
              </div>
 
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  rows="3"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none" 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                />
              </div>
 
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input 
                    type="date" 
                    className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none" 
                    value={formData.dueDate} 
                    onChange={e => setFormData({...formData, dueDate: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select 
                    className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={formData.priority}
                    onChange={e => setFormData({...formData, priority: e.target.value})}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
 
              {formData.id && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select 
                    className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              )}
 
              <div className="pt-4 flex flex-col-reverse sm:flex-row justify-end gap-3 sm:space-x-3 sm:gap-0">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="w-full sm:w-auto px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 text-white font-medium hover:bg-blue-700 rounded-lg transition"
                >
                  {formData.id ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
