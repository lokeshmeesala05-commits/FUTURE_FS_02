import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Building, Globe, Users, CheckCircle } from 'lucide-react';

const Accounts = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Accounts</h1>
          <p className="text-gray-500">Manage companies and organizations you work with.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading accounts...</div>
          ) : accounts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No accounts found. Create them or convert leads to see them here.</div>
          ) : (
            <div className="inline-block min-w-full align-middle">
              <table className="w-full text-left whitespace-nowrap">
                <thead className="bg-gray-50 text-gray-600 text-sm font-medium border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">Account Name</th>
                    <th className="px-6 py-4">Website</th>
                    <th className="px-6 py-4">Industry</th>
                    <th className="px-6 py-4">Owner</th>
                    <th className="px-6 py-4 text-right pr-12">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                {accounts.map(account => (
                  <tr key={account.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                          {account.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-900">{account.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {account.website || '-'}
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{account.industry || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {account.owner?.name || '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button 
                        onClick={() => navigate(`/tasks?relatedType=Account&relatedId=${account.id}&title=Follow up with ${account.name}`)}
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50 transition"
                      >
                        <CheckCircle size={16} />
                        <span>Task</span>
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
    </div>
  );
};

export default Accounts;
