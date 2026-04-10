import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Mail, Phone, Building, User, CheckCircle, Plus, Search, X, Trash2 } from 'lucide-react';

const Contacts = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    title: '',
    accountId: ''
  });

  const fetchContacts = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/contacts`);
      setContacts(res.data || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, []);

  const fetchAccounts = async () => {
     try {
       const res = await api.get('/accounts');
       setAccounts(res.data || []);
     } catch (err) {
       console.error(err);
     }
  };

  useEffect(() => {
    fetchContacts();
    fetchAccounts();
  }, [fetchContacts]);

  const handleOpenModal = (contact = null) => {
    if (contact) {
      setFormData({
        id: contact.id,
        name: contact.name,
        email: contact.email,
        phone: contact.phone || '',
        title: contact.title || '',
        accountId: contact.account_id || ''
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        title: '',
        accountId: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await api.put(`/contacts/${formData.id}`, formData);
      } else {
        await api.post('/contacts', formData);
      }
      setIsModalOpen(false);
      fetchContacts();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error saving contact');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await api.delete(`/contacts/${id}`);
        fetchContacts();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-500">Manage your qualified customers and partners.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition"
        >
          <Plus size={20} />
          <span>New Contact</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search contacts..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading contacts...</div>
          ) : filteredContacts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No contacts found.</div>
          ) : (
            <div className="inline-block min-w-full align-middle">
              <table className="w-full text-left whitespace-nowrap">
                <thead className="bg-gray-50 text-gray-600 text-sm font-medium border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Contact Info</th>
                    <th className="px-6 py-4">Account/Company</th>
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4 text-right pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                {filteredContacts.map(contact => (
                  <tr key={contact.id} className="hover:bg-gray-50 group">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                          {contact.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-900">{contact.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail size={14} className="mr-2" /> {contact.email}
                        </div>
                        {contact.phone && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone size={14} className="mr-2" /> {contact.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      {contact.account ? (
                        <div className="flex items-center">
                          <Building size={14} className="mr-2 text-gray-400" />
                          {contact.account.name}
                        </div>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{contact.title || '-'}</td>
                    <td className="px-6 py-4 text-right flex justify-end items-center space-x-2">
                       <button 
                        onClick={() => navigate(`/app/tasks?relatedType=Contact&relatedId=${contact.id}&title=Call ${contact.name}`)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Schedule Task"
                      >
                        <CheckCircle size={18} />
                      </button>
                       <button 
                        onClick={() => handleOpenModal(contact)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition"
                        title="Edit Contact"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(contact.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete Contact"
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
              <h2 className="text-xl font-bold text-gray-900">{formData.id ? 'Edit Contact' : 'New Contact'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                <input 
                  type="email" 
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500" 
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500" 
                    value={formData.phone} 
                    onChange={e => setFormData({...formData, phone: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500" 
                    value={formData.title} 
                    onChange={e => setFormData({...formData, title: e.target.value})} 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Related Account</label>
                <select 
                  className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  value={formData.accountId}
                  onChange={e => setFormData({...formData, accountId: e.target.value})}
                >
                  <option value="">Select an account</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                  ))}
                </select>
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
                  {formData.id ? 'Update Contact' : 'Create Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contacts;
