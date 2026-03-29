import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { ArrowLeft, Mail, Phone, Calendar, Clock, User as UserIcon, UserCheck, X, CheckCircle } from 'lucide-react';

const STATUS_COLORS = {
  'New': 'bg-blue-100 text-blue-800',
  'Contacted': 'bg-purple-100 text-purple-800',
  'Interested': 'bg-yellow-100 text-yellow-800',
  'Converted': 'bg-green-100 text-green-800',
  'Lost': 'bg-red-100 text-red-800',
};

const LeadDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newActivity, setNewActivity] = useState('');

  // Convert Modal State
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [convertData, setConvertData] = useState({ companyName: '', website: '', title: '' });
  const [isConverting, setIsConverting] = useState(false);

  const fetchLead = async () => {
    try {
      const res = await api.get(`/leads/${id}`);
      setLead(res.data);
      // Pre-populate company name from source if available
      if (res.data.source && !convertData.companyName) {
        setConvertData(prev => ({ ...prev, companyName: res.data.source || '' }));
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLead();
  }, [id]);

  const handleAddActivity = async (e) => {
    e.preventDefault();
    if (!newActivity.trim()) return;
    try {
      await api.post(`/activities`, {
        leadId: id,
        action_type: 'Note Added',
        description: newActivity
      });
      setNewActivity('');
      fetchLead();
    } catch (err) {
      console.error(err);
    }
  };

  const handleConvert = async (e) => {
    e.preventDefault();
    setIsConverting(true);
    try {
      await api.post(`/leads/${id}/convert`, convertData);
      setIsConvertModalOpen(false);
      fetchLead();
      alert('Lead successfully converted to Contact!');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to convert lead');
    }
    setIsConverting(false);
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading lead details...</div>;
  if (!lead) return <div className="p-8 text-center text-red-500">Lead not found or unauthorized.</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <button onClick={() => navigate('/leads')} className="text-gray-500 hover:text-gray-800 flex items-center space-x-2">
          <ArrowLeft size={16} /> <span>Back to Leads</span>
        </button>
        
        <div className="flex space-x-2">
          <button 
            onClick={() => navigate(`/tasks?relatedType=Lead&relatedId=${id}&title=Follow up with ${lead.name}`)}
            className="bg-blue-50 text-blue-600 px-5 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-100 transition font-medium"
          >
            <CheckCircle size={18} />
            <span>Schedule Task</span>
          </button>

          {lead.status !== 'Converted' && (
            <button 
              onClick={() => setIsConvertModalOpen(true)}
              className="bg-green-600 text-white px-5 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700 transition font-medium"
            >
              <UserCheck size={18} />
              <span>Convert to Contact</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center space-x-4 mb-6">
              <div className="h-16 w-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold">
                {lead.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{lead.name}</h2>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full mt-1 inline-block ${STATUS_COLORS[lead.status]}`}>
                  {lead.status}
                </span>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="flex items-start text-sm text-gray-600">
                <Mail size={16} className="mr-3 mt-0.5 text-gray-400" />
                <span className="break-all">{lead.email}</span>
              </div>
              {lead.phone && (
                <div className="flex items-start text-sm text-gray-600">
                  <Phone size={16} className="mr-3 mt-0.5 text-gray-400" />
                  <span>{lead.phone}</span>
                </div>
              )}
              {lead.assignedTo && (
                <div className="flex items-start text-sm text-gray-600">
                  <UserIcon size={16} className="mr-3 mt-0.5 text-gray-400" />
                  <span>Assigned to: {lead.assignedTo.name}</span>
                </div>
              )}
              <div className="flex items-start text-sm text-gray-600">
                <Calendar size={16} className="mr-3 mt-0.5 text-gray-400" />
                <span>Added: {new Date(lead.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          {lead.notes && (
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
               <h3 className="text-sm border-b border-gray-100 pb-2 mb-3 font-semibold text-gray-800">Lead Notes</h3>
               <p className="text-gray-600 text-sm italic">{lead.notes}</p>
             </div>
          )}
        </div>

        <div className="md:col-span-2">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <h2 className="text-lg font-bold text-gray-900 mb-6">Activity Timeline</h2>
             
             <form onSubmit={handleAddActivity} className="mb-8 flex space-x-3">
                <input 
                  type="text" 
                  placeholder="Add a new note or activity..." 
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  value={newActivity}
                  onChange={(e) => setNewActivity(e.target.value)}
                />
                <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 font-medium">Add Note</button>
             </form>

             <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                {lead.activities?.map((activity, index) => (
                  <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-blue-100 text-blue-600 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm relative z-10">
                      <Clock size={16} />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-gray-100 bg-gray-50 shadow-sm relative z-10">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="font-bold text-gray-900 text-sm">{activity.action_type}</h4>
                        <time className="text-xs text-gray-500">{new Date(activity.createdAt).toLocaleString()}</time>
                      </div>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                    </div>
                  </div>
                ))}
                {(!lead.activities || lead.activities.length === 0) && (
                   <p className="text-center text-gray-500 text-sm">No activity recorded yet.</p>
                )}
             </div>
          </div>
        </div>
      </div>

      {isConvertModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-md:max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Convert to Contact</h2>
              <button onClick={() => setIsConvertModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleConvert} className="p-6 space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Converting <strong>{lead.name}</strong> will create a new permanent Contact and an optional Account for their company.
              </p>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name (Account)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Acme Corp"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500" 
                  value={convertData.companyName} 
                  onChange={e => setConvertData({...convertData, companyName: e.target.value})} 
                />
                <p className="text-xs text-gray-400 mt-1">Leave blank for individual contacts</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Website</label>
                <input 
                  type="text" 
                  placeholder="https://..."
                  className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500" 
                  value={convertData.website} 
                  onChange={e => setConvertData({...convertData, website: e.target.value})} 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Sales Manager"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500" 
                  value={convertData.title} 
                  onChange={e => setConvertData({...convertData, title: e.target.value})} 
                />
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => setIsConvertModalOpen(false)} 
                  className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isConverting}
                  className="px-5 py-2.5 bg-green-600 text-white font-medium hover:bg-green-700 rounded-lg transition disabled:opacity-50 flex items-center"
                >
                  {isConverting ? 'Converting...' : 'Confirm Conversion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadDetails;
