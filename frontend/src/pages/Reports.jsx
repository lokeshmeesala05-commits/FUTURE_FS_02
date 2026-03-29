import React, { useState, useEffect } from 'react';
import api from '../api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { Download, BarChart2, CheckCircle, Target, TrendingUp } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [leadsData, setLeadsData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [tasksData, setTasksData] = useState([]);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        const [leadsRes, revenueRes, tasksRes] = await Promise.all([
          api.get('/reports/leads'),
          api.get('/reports/revenue'),
          api.get('/reports/tasks')
        ]);

        setLeadsData(leadsRes.data || []);
        setRevenueData(revenueRes.data || []);
        setTasksData(tasksRes.data || []);
      } catch (err) {
        console.error('Error fetching reports:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const downloadCSV = (data, filename) => {
    if (!data || !data.length) return;
    
    // Convert array of objects to CSV string
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => Object.values(obj).join(',')).join('\n');
    const csvContent = `${headers}\n${rows}`;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatLeadsForChart = () => {
    return leadsData.map(item => ({
      name: item.status,
      Count: parseInt(item.count, 10)
    }));
  };

  const formatRevenueForChart = () => {
    return revenueData.map(item => ({
      name: item.stage,
      Value: parseFloat(item.totalValue || 0)
    }));
  };

  const formatTasksForChart = () => {
    return tasksData.map(item => ({
      name: item.status,
      value: parseInt(item.count, 10)
    }));
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Generating reports...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-500">Analyze your sales performance and pipeline metadata.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leads Report */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Target className="text-blue-500" size={20} />
              Lead Conversion by Status
            </h2>
            <button 
              onClick={() => downloadCSV(leadsData, 'leads_report')}
              className="text-gray-500 hover:text-blue-600 p-1.5 rounded-lg hover:bg-gray-100 transition"
              title="Download Leads CSV"
            >
              <Download size={18} />
            </button>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formatLeadsForChart()}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="Count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Report */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <TrendingUp className="text-green-500" size={20} />
              Deal Revenue Pipeline
            </h2>
            <button 
              onClick={() => downloadCSV(revenueData, 'revenue_report')}
              className="text-gray-500 hover:text-blue-600 p-1.5 rounded-lg hover:bg-gray-100 transition"
              title="Download Revenue CSV"
            >
              <Download size={18} />
            </button>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formatRevenueForChart()}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(val) => `₹${val / 1000}k`} />
                <RechartsTooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                <Bar dataKey="Value" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Performance Report */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <CheckCircle className="text-purple-500" size={20} />
              Task Completion Status
            </h2>
            <button 
              onClick={() => downloadCSV(tasksData, 'tasks_report')}
              className="text-gray-500 hover:text-blue-600 p-1.5 rounded-lg hover:bg-gray-100 transition"
              title="Download Tasks CSV"
            >
              <Download size={18} />
            </button>
          </div>
          <div className="h-72 flex justify-center items-center">
            {tasksData && tasksData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={formatTasksForChart()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {formatTasksForChart().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400">No task data available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
