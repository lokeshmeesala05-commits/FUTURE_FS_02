import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Plus, Search, Filter, X, DollarSign, Calendar, Building2, UserCircle, Briefcase, CheckCircle } from 'lucide-react';

const STAGE_COLORS = {
  'Qualification': 'bg-gray-100 text-gray-800',
  'Need Analysis': 'bg-blue-100 text-blue-800',
  'Proposal': 'bg-purple-100 text-purple-800',
  'Negotiation': 'bg-orange-100 text-orange-800',
  'Closed Won': 'bg-green-100 text-green-800',
  'Closed Lost': 'bg-red-100 text-red-800',
};

const Deals = () => {
  const navigate = useNavigate();
  const [deals, setDeals] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStage, setFilterStage] = useState('All');
  
  const [formData, setFormData] = useState({
    name: '',
    value: '',
    stage: 'Qualification',
    expectedCloseDate: '',
    accountId: '',
    contactId: ''
  });

  const fetchDeals = async () => {
    try {
      const res = await api.get('/deals');
      setDeals(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDependencies = async () => {
    try {
      const [accRes, conRes] = await Promise.all([
        api.get('/accounts'),
        api.get('/contacts')
      ]);
      setAccounts(accRes.data);
      setContacts(conRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchDeals(), fetchDependencies()]);
      setLoading(false);
    };
    init();
  }, []);

  const handleOpenModal = (deal = null) => {
    if (deal) {
      setFormData({
        id: deal.id,
        name: deal.name,
        value: deal.value,
        stage: deal.stage,
        expectedCloseDate: deal.expectedCloseDate ? deal.expectedCloseDate.split('T')[0] : '',
        accountId: deal.accountId || '',
        contactId: deal.contactId || ''
      });
    } else {
      setFormData({
        name: '',
        value: '',
        stage: 'Qualification',
        expectedCloseDate: '',
        accountId: '',
        contactId: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await api.put(`/deals/${formData.id}`, formData);
      } else {
        await api.post('/deals', formData);
      }
      setIsModalOpen(false);
      fetchDeals();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error saving deal');
    }
  };

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.account?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = filterStage === 'All' || deal.stage === filterStage;
    return matchesSearch && matchesStage;
  });

  const totalValue = filteredDeals.reduce((sum, deal) => sum + parseFloat(deal.value || 0), 0);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading deals...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Deals</h1>
          <p className="text-gray-500">Manage your revenue pipeline and opportunities.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition"
        >
          <Plus size={20} />
          <span>New Deal</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-full lg:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search deals or accounts..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <div className="flex items-center space-x-2">
            <Filter size={18} className="text-gray-400" />
            <select 
              className="border-none bg-transparent focus:ring-0 text-gray-600 font-medium cursor-pointer"
              value={filterStage}
              onChange={(e) => setFilterStage(e.target.value)}
            >
              <option value="All">All Stages</option>
              {Object.keys(STAGE_COLORS).map(stage => (
                <option key={stage} value={stage}>{stage}</option>
              ))}
            </select>
          </div>
          <div className="hidden sm:block h-6 w-px bg-gray-200"></div>
          <div className="text-sm font-semibold text-gray-900">
            Total: <span className="text-blue-600 font-bold">₹{totalValue.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Deal Details</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Account & Contact</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Value</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Stage</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Expected Close</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDeals.map(deal => (
                  <tr key={deal.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                          <Briefcase size={20} />
                        </div>
                        <span className="font-semibold text-gray-900">{deal.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {deal.account && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Building2 size={14} className="mr-2" /> {deal.account.name}
                          </div>
                        )}
                        {deal.contact && (
                          <div className="flex items-center text-sm text-gray-400">
                            <UserCircle size={14} className="mr-2" /> {deal.contact.name}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-900">₹{parseFloat(deal.value).toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${STAGE_COLORS[deal.stage]}`}>
                        {deal.stage}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar size={14} className="mr-2" />
                        {deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toLocaleDateString() : 'Not set'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end space-x-2">
                      <button 
                        onClick={() => navigate(`/app/tasks?relatedType=Deal&relatedId=${deal.id}&title=Follow up on ${deal.name}`)}
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50 transition"
                        title="Schedule Task"
                      >
                        <CheckCircle size={16} />
                        <span>Task</span>
                      </button>
                      <button 
                        onClick={() => handleOpenModal(deal)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredDeals.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      No deals found. Create your first opportunity to start tracking revenue!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">{formData.id ? 'Edit Deal' : 'New Sales Deal'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deal Name *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. 50 Units Hardware Sale"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                />
              </div>
 
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Value (₹) *</label>
                  <input 
                    type="number" 
                    required
                    placeholder="0.00"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500" 
                    value={formData.value} 
                    onChange={e => setFormData({...formData, value: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
                  <select 
                    className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    value={formData.stage}
                    onChange={e => setFormData({...formData, stage: e.target.value})}
                  >
                    {Object.keys(STAGE_COLORS).map(stage => (
                      <option key={stage} value={stage}>{stage}</option>
                    ))}
                  </select>
                </div>
              </div>
 
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Related Account</label>
                  <select 
                    className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    value={formData.accountId}
                    onChange={e => setFormData({...formData, accountId: e.target.value})}
                  >
                    <option value="">Select Account</option>
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Primary Contact</label>
                  <select 
                    className="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    value={formData.contactId}
                    onChange={e => setFormData({...formData, contactId: e.target.value})}
                  >
                    <option value="">Select Contact</option>
                    {contacts.map(con => (
                      <option key={con.id} value={con.id}>{con.name}</option>
                    ))}
                  </select>
                </div>
              </div>
 
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Close Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="date" 
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500" 
                    value={formData.expectedCloseDate} 
                    onChange={e => setFormData({...formData, expectedCloseDate: e.target.value})} 
                  />
                </div>
              </div>
 
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
                  {formData.id ? 'Update Deal' : 'Create Deal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Deals;
