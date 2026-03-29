import React, { useState, useEffect } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, X, Phone, Mail, Eye } from 'lucide-react';

const STATUS_COLORS = {
  'New': 'bg-blue-100 text-blue-800',
  'Contacted': 'bg-purple-100 text-purple-800',
  'Interested': 'bg-yellow-100 text-yellow-800',
  'Converted': 'bg-green-100 text-green-800',
  'Lost': 'bg-red-100 text-red-800',
};

const STATUS_OPTIONS = ['New', 'Contacted', 'Interested', 'Converted', 'Lost'];

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', source: '', status: 'New', notes: '' });
  const [editingId, setEditingId] = useState(null);

  const fetchLeads = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/leads', {
        params: { search, status: statusFilter, limit: 50 }
      });
      setLeads(res.data.leads || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [search, statusFilter]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchLeads();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search, statusFilter, fetchLeads]);

  const handleOpenModal = (lead = null) => {
    if (lead) {
      setEditingId(lead.id);
      setFormData(lead);
    } else {
      setEditingId(null);
      setFormData({ name: '', email: '', phone: '', source: '', status: 'New', notes: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/leads/${editingId}`, formData);
      } else {
        await api.post(`/leads`, formData);
      }
      setIsModalOpen(false);
      fetchLeads();
    } catch (err) {
      console.error(err);
      alert('Failed to save lead');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) return;
    try {
      await api.delete(`/leads/${id}`);
      fetchLeads();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads Directory</h1>
          <p className="text-gray-500">Manage and track all your prospective customers.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition"
        >
          <Plus size={18} />
          <span>Add Lead</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search leads by name, email, or phone..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="relative sm:w-64">
             <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
             <select 
               className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white"
               value={statusFilter}
               onChange={(e) => setStatusFilter(e.target.value)}
             >
               <option value="">All Statuses</option>
               {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
             </select>
          </div>
        </div>

        <div className="overflow-x-auto -mx-1 sm:mx-0">
          <div className="inline-block min-w-full align-middle">
            {loading ? (
               <div className="p-8 text-center text-gray-500">Loading leads...</div>
            ) : leads.length === 0 ? (
               <div className="p-8 text-center text-gray-500">No leads found matching your criteria.</div>
            ) : (
              <table className="w-full text-left whitespace-nowrap">
                <thead className="bg-gray-50 text-gray-600 text-sm font-medium border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">Lead Name</th>
                    <th className="px-6 py-4">Contact Info</th>
                    <th className="px-6 py-4">Source</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Date Added</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                {leads.map(lead => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Link to={`/leads/${lead.id}`} className="flex items-center space-x-3 group">
                         <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold group-hover:bg-blue-600 group-hover:text-white transition">
                            {lead.name.charAt(0).toUpperCase()}
                         </div>
                         <div>
                            <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition">{lead.name}</p>
                            <p className="text-sm text-gray-500">{lead.assignedTo?.name || 'Unassigned'}</p>
                         </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                         <div className="flex items-center text-sm text-gray-600">
                           <Mail size={14} className="mr-2" /> {lead.email}
                         </div>
                         {lead.phone && (
                           <div className="flex items-center text-sm text-gray-600">
                             <Phone size={14} className="mr-2" /> {lead.phone}
                           </div>
                         )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{lead.source || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${STATUS_COLORS[lead.status]}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <Link to={`/leads/${lead.id}`} className="text-gray-400 hover:text-blue-600 transition" title="View Details">
                        <Eye size={18} className="inline" />
                      </Link>
                      <button onClick={() => handleOpenModal(lead)} className="text-blue-600 hover:text-blue-800 font-medium text-sm">Edit</button>
                      <button onClick={() => handleDelete(lead.id)} className="text-red-600 hover:text-red-800 font-medium text-sm">Delete</button>
                    </td>
                  </tr>
                ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">{editingId ? 'Edit Lead' : 'Add New Lead'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input required type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input required type="email" className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                  <input type="text" placeholder="e.g. Website, Referral" className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500" value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea rows="3" className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}></textarea>
                </div>
              </div>
              <div className="pt-4 flex flex-col-reverse sm:flex-row justify-end gap-3 sm:space-x-3 sm:gap-0">
                <button type="button" onClick={() => setIsModalOpen(false)} className="w-full sm:w-auto px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition">Cancel</button>
                <button type="submit" className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 text-white font-medium hover:bg-blue-700 rounded-lg transition">Save Lead</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;
