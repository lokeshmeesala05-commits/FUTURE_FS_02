import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, TrendingUp, Clock, Target, CheckCircle, Calendar } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, trend, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
        <Icon className={color.replace('bg-', 'text-')} size={24} />
      </div>
      {trend && (
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          trend.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {trend}
        </span>
      )}
    </div>
    <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard/stats');
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading your performance data...</div>;
  if (!stats) return <div className="p-8 text-center text-red-500">Error loading dashboard stats. Please try again.</div>;

  const leadsChartData = (stats.leadsByStatus || []).map(s => ({
    name: s.status,
    Leads: parseInt(s.count, 10)
  }));

  const dealsChartData = (stats.dealsByStage || []).map(s => ({
    name: s.stage,
    Value: parseFloat(s.totalValue || 0)
  }));

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
          <p className="text-sm text-gray-500">Here's what's happening with your sales pipeline today.</p>
        </div>
        <div className="hidden sm:flex items-center space-x-2 bg-white px-4 py-2 rounded-lg border border-gray-100 shadow-sm text-sm font-medium text-gray-600">
          <Clock size={16} />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Leads" 
          value={stats.totalLeads} 
          icon={Users} 
          trend="+12%" 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Pipeline Value" 
          value={`₹${stats.totalPipelineValue.toLocaleString()}`} 
          icon={TrendingUp} 
          trend="+5%" 
          color="bg-green-500" 
        />
        <StatCard 
          title="Conversion Rate" 
          value={`${stats.conversionRate ?? 0}%`} 
          icon={Target} 
          color="bg-purple-500" 
        />
        <StatCard 
          title="Tasks Due Today" 
          value={stats.pendingTasksCount || 0} 
          icon={CheckCircle} 
          color="bg-orange-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Leads by Status</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leadsChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="Leads" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Deals Value by Stage</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dealsChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="Value" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <CheckCircle className="text-blue-500" size={20} />
            Upcoming Tasks
          </h2>
          <div className="space-y-4">
            {(stats.upcomingTasks || []).length > 0 ? (
              stats.upcomingTasks.map(task => (
                <div key={task.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`mt-1 h-2 w-2 rounded-full ${
                    task.priority === 'High' ? 'bg-red-500' : task.priority === 'Medium' ? 'bg-orange-500' : 'bg-gray-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{task.title}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                      <Calendar size={12} />
                      {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No upcoming tasks.</p>
            )}
            <button className="w-full text-center text-sm font-medium text-blue-600 hover:text-blue-700 mt-2" onClick={() => navigate('/app/tasks')}>
               View All Tasks
            </button>
          </div>
        </div>

        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-6 font-semibold">Quick Actions</h2>
          <div className="space-y-3">
             <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-lg transition" onClick={() => navigate('/app/leads')}>
                Add New Lead
             </button>
             <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-lg transition" onClick={() => navigate('/app/deals')}>
                Create New Deal
             </button>
             <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-lg transition" onClick={() => navigate('/app/tasks')}>
                Add Follow-up Task
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
