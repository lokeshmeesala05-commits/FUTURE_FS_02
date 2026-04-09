const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// --- SUPABASE CONFIGURATION ---
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('WARNING: SUPABASE_URL or SUPABASE_KEY is missing in .env');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// --- AUTH MIDDLEWARE ---
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) {
        return res.status(401).json({ message: 'Not authorized, token failed' });
      }
      req.user = user;
      req.user.role = user.user_metadata?.role || 'User'; 
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed', error: error.message });
    }
  }
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `User role ${req.user.role} is not authorized` });
    }
    next();
  };
};

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());

// --- INQUIRY CONTROLLER (PUBLIC) ---
const submitInquiry = async (req, res) => {
  try {
    const { name, email, phone, factors } = req.body;
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and Email are required' });
    }
    const { data, error } = await supabase
      .from('leads')
      .insert([{ name, email, phone, factors: factors || {}, status: 'new' }])
      .select();
    if (error) throw error;
    res.status(201).json({ message: 'Inquiry submitted successfully', inquiry: data[0] });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// --- AUTH CONTROLLERS ---
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role: role || 'Sales User' } }
    });
    if (error) return res.status(400).json({ message: error.message });
    const { user, session } = data;
    res.status(201).json({
      id: user.id,
      name: user.user_metadata?.name || name,
      email: user.email,
      role: user.user_metadata?.role || role || 'Sales User',
      isVerified: user.email_confirmed_at ? true : false,
      token: session?.access_token || null,
      message: 'Registration successful. Please check your email for verification.'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return res.status(401).json({ message: error.message });
    const { user, session } = data;
    res.json({
      id: user.id,
      name: user.user_metadata?.name || '',
      email: user.email,
      role: user.user_metadata?.role || 'Sales User',
      isVerified: user.email_confirmed_at ? true : false,
      token: session.access_token,
      message: 'Login successful'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// --- LEAD CONTROLLERS (ADMIN) ---
const getLeads = async (req, res) => {
  try {
    const { status, source, search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    let query = supabase.from('leads').select('*', { count: 'exact' });
    if (status) query = query.eq('status', status);
    if (source) query = query.eq('source', source);
    if (search) query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);
    if (error) throw error;
    res.json({ leads: data, totalPages: Math.ceil(count / limit), currentPage: parseInt(page), totalLeads: count });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// --- ACCOUNT CONTROLLERS ---
const getAccounts = async (req, res) => {
    try {
        const { data, error } = await supabase.from('accounts').select('*').order('name');
        if (error) throw error;
        res.json(data);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const createAccount = async (req, res) => {
    try {
        const { data, error } = await supabase.from('accounts').insert([{ ...req.body, owner_id: req.user.id }]).select();
        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// --- CONTACT CONTROLLERS ---
const getContacts = async (req, res) => {
    try {
        const { data, error } = await supabase.from('contacts').select('*, account:accounts(name)').order('name');
        if (error) throw error;
        res.json(data);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const createContact = async (req, res) => {
    try {
        const { data, error } = await supabase.from('contacts').insert([{ ...req.body, owner_id: req.user.id }]).select();
        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// --- DEAL CONTROLLERS ---
const getDeals = async (req, res) => {
    try {
        const { data, error } = await supabase.from('deals').select('*, account:accounts(name), contact:contacts(name)').order('created_at', { ascending: false });
        if (error) throw error;
        res.json(data);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const createDeal = async (req, res) => {
    try {
        const { data, error } = await supabase.from('deals').insert([{ ...req.body, owner_id: req.user.id }]).select();
        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// --- TASK CONTROLLERS ---
const getTasks = async (req, res) => {
    try {
        const { data, error } = await supabase.from('tasks').select('*').order('due_date');
        if (error) throw error;
        res.json(data);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const createTask = async (req, res) => {
    try {
        const { data, error } = await supabase.from('tasks').insert([{ ...req.body, assigned_to: req.user.id }]).select();
        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// --- ROUTES ---

// Root Route
app.get('/', (req, res) => {
  res.send('<h1>CRM Pro API</h1><p>The backend is running successfully. <a href="/api/health">Check API Health</a></p>');
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running', version: '3.0.0' });
});

// Auth Routes
app.post('/api/auth/register', registerUser);
app.post('/api/auth/login', loginUser);
app.get('/api/auth/me', protect, (req, res) => res.json(req.user));
app.post('/api/auth/verify-email', async (req, res) => {
    const { email, otp } = req.body;
    const { data, error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'signup' });
    if (error) return res.status(400).json({ message: error.message });
    res.json({ message: 'Email verified successfully', user: data.user });
});

// Inquiry Routes (Public)
app.post('/api/inquiry', submitInquiry);

// Lead Routes (Protected)
app.get('/api/leads', protect, getLeads);
app.get('/api/leads/:id', protect, async (req, res) => {
    const { data: lead, error } = await supabase.from('leads').select('*').eq('id', req.params.id).single();
    if (error || !lead) return res.status(404).json({ message: 'Lead not found' });
    res.json(lead);
});
app.put('/api/leads/:id', protect, async (req, res) => {
    const { data, error } = await supabase.from('leads').update(req.body).eq('id', req.params.id).select();
    if (error) return res.status(500).json({ message: 'Server error', error: error.message });
    res.json(data[0]);
});
app.delete('/api/leads/:id', protect, async (req, res) => {
    const { error } = await supabase.from('leads').delete().eq('id', req.params.id);
    if (error) return res.status(500).json({ message: 'Server error', error: error.message });
    res.json({ message: 'Lead removed' });
});

// Account Routes (Protected)
app.get('/api/accounts', protect, getAccounts);
app.post('/api/accounts', protect, createAccount);
app.put('/api/accounts/:id', protect, async (req, res) => {
    const { data, error } = await supabase.from('accounts').update(req.body).eq('id', req.params.id).select();
    if (error) return res.status(500).json({ message: error.message });
    res.json(data[0]);
});
app.delete('/api/accounts/:id', protect, async (req, res) => {
    const { error } = await supabase.from('accounts').delete().eq('id', req.params.id);
    if (error) return res.status(500).json({ message: error.message });
    res.json({ message: 'Account removed' });
});

// Contact Routes (Protected)
app.get('/api/contacts', protect, getContacts);
app.post('/api/contacts', protect, createContact);
app.put('/api/contacts/:id', protect, async (req, res) => {
    const { data, error } = await supabase.from('contacts').update(req.body).eq('id', req.params.id).select();
    if (error) return res.status(500).json({ message: error.message });
    res.json(data[0]);
});
app.delete('/api/contacts/:id', protect, async (req, res) => {
    const { error } = await supabase.from('contacts').delete().eq('id', req.params.id);
    if (error) return res.status(500).json({ message: error.message });
    res.json({ message: 'Contact removed' });
});

// Deal Routes (Protected)
app.get('/api/deals', protect, getDeals);
app.post('/api/deals', protect, createDeal);
app.put('/api/deals/:id', protect, async (req, res) => {
    const { data, error } = await supabase.from('deals').update(req.body).eq('id', req.params.id).select();
    if (error) return res.status(500).json({ message: error.message });
    res.json(data[0]);
});
app.delete('/api/deals/:id', protect, async (req, res) => {
    const { error } = await supabase.from('deals').delete().eq('id', req.params.id);
    if (error) return res.status(500).json({ message: error.message });
    res.json({ message: 'Deal removed' });
});

// Task Routes (Protected)
app.get('/api/tasks', protect, getTasks);
app.post('/api/tasks', protect, createTask);
app.put('/api/tasks/:id', protect, async (req, res) => {
    const { data, error } = await supabase.from('tasks').update(req.body).eq('id', req.params.id).select();
    if (error) return res.status(500).json({ message: error.message });
    res.json(data[0]);
});
app.delete('/api/tasks/:id', protect, async (req, res) => {
    const { error } = await supabase.from('tasks').delete().eq('id', req.params.id);
    if (error) return res.status(500).json({ message: error.message });
    res.json({ message: 'Task removed' });
});



const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Backend consolidated into a single server.js file.');
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please kill the process using it.`);
  } else {
    console.error('Server error:', error);
  }
});

// Keep process alive and monitor listening status
setInterval(() => {
  if (!server.listening) {
    console.error('Server is no longer listening! Closing process...');
    process.exit(1);
  }
}, 10000);
