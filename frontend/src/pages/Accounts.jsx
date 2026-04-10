import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Building, Globe, Users, CheckCircle, Plus, Search, X, Trash2, MapPin } from 'lucide-react';

const Accounts = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    website: '',
    industry: '',
    description: '',
    address: ''
  });

  const fetchAccounts = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/accounts`);
      setAccounts(res.data || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleOpenModal = (account = null) => {
    if (account) {
      setFormData({
        id: account.id,
        name: account.name,
        website: account.website || '',
        industry: account.industry || '',
        description: account.description || '',
        address: account.address || ''
      });
    } else {
      setFormData({
        name: '',
        website: '',
        industry: '',
        description: '',
        address: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await api.put(`/accounts/${formData.id}`, formData);
      } else {
        await api.post('/accounts', formData);
      }
      setIsModalOpen(false);
      fetchAccounts();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error saving account');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this account? This will not delete related contacts or deals but may disconnect them.')) {
      try {
        await api.delete(`/accounts/${id}`);
        fetchAccounts();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filteredAccounts = accounts.filter(account => 
    account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (account.industry && account.industry.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Accounts</h1>
          <p className="text-gray-500">Manage companies and organizations you work with.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition"
        >
          <Plus size={20} />
          <span>New Account</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search accounts or industries..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading accounts...</div>
          ) : filteredAccounts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No accounts found.</div>
          ) : (
            <div className="inline-block min-w-full align-middle">
              <table className="w-full text-left whitespace-nowrap">
                <thead className="bg-gray-50 text-gray-600 text-sm font-medium border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">Account Name</th>
                    <th className="px-6 py-4">Website</th>
                    <th className="px-6 py-4">Industry</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                {filteredAccounts.map(account => (
                  <tr key={account.id} className="hover:bg-gray-50 group">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                          {account.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-900">{account.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {account.website ? (
                        <a href={account.website.startsWith('http') ? account.website : `https://${account.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-blue-600">
                          <Globe size={14} className="mr-2" /> {account.website}
                        </a>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{account.industry || '-'}</td>
                    <td className="px-6 py-4 text-right flex justify-end items-center space-x-2">
                       <button 
                        onClick={() => navigate(`/app/tasks?relatedType=Account&relatedId=${account.id}&title=Follow up with ${account.name}`)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Schedule Task"
                      >
                        <CheckCircle size={18} />
                      </button>
                       <button 
                        onClick={() => handleOpenModal(account)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition"
                        title="Edit Account"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(account.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete Account"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">{formData.id ? 'Edit Account' : 'New Account'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Acme Corp"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <input 
                    type="text" 
                    placeholder="www.example.com"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500" 
                    value={formData.website} 
                    onChange={e => setFormData({...formData, website: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Technology"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500" 
                    value={formData.industry} 
                    onChange={e => setFormData({...formData, industry: e.target.value})} 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <div className="relative">
                   <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                   <textarea 
                    rows="2"
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500" 
                    value={formData.address} 
                    onChange={e => setFormData({...formData, address: e.target.value})} 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  rows="3"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500" 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                />
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  {formData.id ? 'Update Account' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounts;
