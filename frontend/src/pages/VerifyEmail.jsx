import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Mail, ShieldCheck, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';

const VerifyEmail = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [success, setSuccess] = useState('');

  const { verifyOtp, resendOtp, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const email = user?.email || location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await verifyOtp(email, otp);
      if (res.success) {
        setSuccess('Email verified successfully! Redirecting...');
        setTimeout(() => navigate('/'), 2000);
      } else {
        setError(res.message || 'Verification failed');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setResending(true);
    setError('');
    setSuccess('');

    try {
      const res = await resendOtp(email);
      if (res.success) {
        setSuccess('A new code has been sent to your email.');
        setTimer(60);
        setCanResend(false);
      } else {
        setError(res.message || 'Failed to resend code');
      }
    } catch (err) {
      setError('Could not resend code. Please try again later.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen dynamic-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full glass-card p-8 animate-fade-in text-center">
        <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldCheck className="w-10 h-10 text-blue-400" />
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-2">Verify Your Email</h1>
        <p className="text-slate-300 mb-8">
          We've sent a 6-digit verification code to <br />
          <span className="text-blue-400 font-semibold">{email}</span>
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl flex items-center gap-3 text-red-200 text-sm animate-shake">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/50 rounded-xl flex items-center gap-3 text-emerald-200 text-sm">
            <ShieldCheck className="w-5 h-5 flex-shrink-0" />
            <p>{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              maxLength="6"
              placeholder="000 000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-4 text-center text-3xl font-bold tracking-[1em] text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-600"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full h-14 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]"
          >
            {loading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Verify Email <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-800">
          <p className="text-slate-400 text-sm mb-4">Didn't receive the code?</p>
          <button
            onClick={handleResend}
            disabled={!canResend || resending}
            className={`flex items-center gap-2 mx-auto font-semibold transition-all ${
              canResend 
                ? 'text-blue-400 hover:text-blue-300' 
                : 'text-slate-600 cursor-not-allowed'
            }`}
          >
            {resending ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            {canResend ? 'Resend New Code' : `Resend in ${timer}s`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
