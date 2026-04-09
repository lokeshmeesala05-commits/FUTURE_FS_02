import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import { Mail, Phone, LogIn, LogOut } from 'lucide-react';

const LandingPage = () => {
    const { user, login, logout } = useContext(AuthContext);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', factors: '' });
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [status, setStatus] = useState({ type: '', message: '' });
    const [showLogin, setShowLogin] = useState(false);


    useEffect(() => {
        // No longer fetching leads publicly for privacy reasons
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: 'loading', message: 'Sending your inquiry...' });
        try {
            await api.post('/inquiry', formData);
            setStatus({ type: 'success', message: 'Thank you! Your inquiry has been submitted. Our team will contact you soon.' });
            setFormData({ name: '', email: '', phone: '', factors: '' });
        } catch (error) {
            setStatus({ type: 'error', message: error.response?.data?.message || 'Error sending' });
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await login(loginData.email, loginData.password);
            setShowLogin(false);
        } catch (error) { alert('Login failed'); }
    };



    return (
        <div className="min-h-screen bg-slate-950 font-['Outfit'] text-white selection:bg-blue-500/30">
            {/* Header / Navbar */}
            <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                        <span className="text-xl font-bold tracking-tight">Public CRM Dashboard</span>
                    </div>
                    <div className="flex items-center gap-4">
                        {user ? (
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-slate-400">Admin: <b className="text-white">{user.name}</b></span>
                                <button onClick={logout} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/20 rounded-full hover:bg-red-500/20 transition-all">
                                    <LogOut size={16} /> Logout
                                </button>
                            </div>
                        ) : (
                            <button onClick={() => setShowLogin(!showLogin)} className="flex items-center gap-2 px-5 py-2 text-sm font-medium border border-white/10 rounded-full hover:bg-white/5 transition-colors">
                                <LogIn size={16} /> Admin Access
                            </button>
                        )}
                    </div>
                </div>
                
                {/* Inline Login Form */}
                {showLogin && !user && (
                    <div className="bg-slate-900 border-b border-white/10 p-6 animate-in slide-in-from-top duration-300">
                        <form onSubmit={handleLogin} className="mx-auto max-w-xl flex flex-col sm:flex-row gap-4">
                            <input 
                                required type="email" placeholder="Admin Email"
                                className="flex-1 bg-slate-800 border border-white/10 rounded-xl px-4 py-2 outline-none focus:border-blue-500"
                                value={loginData.email} onChange={e => setLoginData({...loginData, email: e.target.value})}
                            />
                            <input 
                                required type="password" placeholder="Password"
                                className="flex-1 bg-slate-800 border border-white/10 rounded-xl px-4 py-2 outline-none focus:border-blue-500"
                                value={loginData.password} onChange={e => setLoginData({...loginData, password: e.target.value})}
                            />
                            <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-xl font-bold transition-all">Login</button>
                        </form>
                    </div>
                )}
            </header>

            <main className="pt-32 pb-20 px-6 space-y-20">
                {/* Hero & Form Section */}
                <div className="mx-auto max-w-7xl grid lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <h1 className="text-5xl lg:text-7xl font-bold leading-[1.1] mb-6">
                            Interact with <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">Real-Time</span> Data.
                        </h1>
                        <p className="text-slate-400 text-lg mb-10 max-w-lg leading-relaxed">
                            Submit your inquiry below. All entries are visible to the public in real-time. Admins can login to manage the data directly.
                        </p>
                    </div>

                    <div className="relative bg-slate-900/50 border border-white/10 p-8 rounded-2xl backdrop-blur-xl">
                        <h2 className="text-2xl font-bold mb-6">New Inquiry Form</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input 
                                required placeholder="Full Name"
                                className="w-full bg-slate-800/50 border border-white/5 rounded-xl px-4 py-3 outline-none focus:border-blue-500/50"
                                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <input 
                                    required type="email" placeholder="Email"
                                    className="w-full bg-slate-800/50 border border-white/5 rounded-xl px-4 py-3 outline-none focus:border-blue-500/50"
                                    value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                                />
                                <input 
                                    type="tel" placeholder="Phone"
                                    className="w-full bg-slate-800/50 border border-white/5 rounded-xl px-4 py-3 outline-none focus:border-blue-500/50"
                                    value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                                />
                            </div>
                            <textarea 
                                rows="2" placeholder="Factors / Requirements"
                                className="w-full bg-slate-800/50 border border-white/5 rounded-xl px-4 py-3 outline-none focus:border-blue-500/50 resize-none"
                                value={formData.factors} onChange={e => setFormData({...formData, factors: e.target.value})}
                            />
                            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 py-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20">
                                {status.type === 'loading' ? 'Sending...' : 'Submit to Public Directory'}
                            </button>
                            {status.message && (
                                <div className={`text-center p-3 rounded-lg text-sm ${status.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                    {status.message}
                                </div>
                            )}
                        </form>
                    </div>
                </div>

            </main>

            {/* Subtle light spots */}
            <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2" />
        </div>
    );
};

export default LandingPage;
