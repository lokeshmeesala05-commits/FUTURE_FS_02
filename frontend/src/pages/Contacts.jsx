import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Mail, Phone, Building, User, CheckCircle } from 'lucide-react';

const Contacts = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/contacts`);
      setContacts(res.data || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-500">Manage your qualified customers and partners.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading contacts...</div>
          ) : contacts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No contacts found. Convert leads to see them here.</div>
          ) : (
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-600 text-sm font-medium border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Contact Info</th>
                  <th className="px-6 py-4">Account/Company</th>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {contacts.map(contact => (
                  <tr key={contact.id} className="hover:bg-gray-50">
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
                    <td className="px-6 py-4 text-right">
                       <button 
                        onClick={() => navigate(`/tasks?relatedType=Contact&relatedId=${contact.id}&title=Call ${contact.name}`)}
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
          )}
        </div>
      </div>
    </div>
  );
};

export default Contacts;
