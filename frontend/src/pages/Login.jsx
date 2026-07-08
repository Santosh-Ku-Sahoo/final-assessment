import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { KeyRound, Mail, User, ShieldAlert, Building } from 'lucide-react';

const Login = () => {
  const { login, apiUrl, user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);


  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');


  useEffect(() => {

    if (user) {
      redirectUser(user.role);
      return;
    }

    const checkSystemState = async () => {
      try {

        const res = await fetch(`${apiUrl}/appointments/hosts`);
        const data = await res.json();


        const setupCheck = await fetch(`${apiUrl}/auth/setup-admin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });
        const setupData = await setupCheck.json();
        if (setupData.error === 'System is already initialized') {
          setNeedsSetup(false);
        } else {
          setNeedsSetup(true);
        }
      } catch (err) {
        console.error('Error checking system setup:', err);
      }
    };
    checkSystemState();
  }, [user, apiUrl]);

  const redirectUser = (role) => {
    if (role === 'admin') navigate('/admin');
    else if (role === 'host') navigate('/host');
    else if (role === 'security') navigate('/security');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      showToast('Welcome back!', 'success');

      fetch(`${apiUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) redirectUser(data.user.role);
        });
    } else {
      showToast(result.error || 'Invalid credentials', 'error');
    }
  };

  const handleSetupSubmit = async (e) => {
    e.preventDefault();
    if (!adminName || !adminEmail || !adminPassword) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/auth/setup-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: adminName,
          email: adminEmail,
          password: adminPassword,
        }),
      });
      const data = await response.json();
      setLoading(false);

      if (data.success) {
        showToast('Admin setup completed successfully! Logging in...', 'success');
        localStorage.setItem('token', data.token);

        window.location.reload();
      } else {
        showToast(data.error || 'Admin setup failed', 'error');
      }
    } catch (err) {
      setLoading(false);
      showToast('Could not reach setup server', 'error');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: 'radial-gradient(circle at 50% 50%, var(--bg-secondary), var(--bg-primary))'
      }}
    >
      <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ display: 'inline-flex', padding: '16px', background: 'var(--bg-tertiary)', borderRadius: '50%', color: 'var(--color-primary)', marginBottom: '16px' }}>
            <Building size={32} />
          </div>
          <h2>VisiPass Gate Console</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '6px' }}>
            {needsSetup ? 'Initialize system administration' : 'Staff entry portal'}
          </p>
        </div>

        {needsSetup ? (
          <form onSubmit={handleSetupSubmit}>
            <div
              style={{
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                borderRadius: 'var(--border-radius-sm)',
                padding: '12px 16px',
                marginBottom: '20px',
                display: 'flex',
                gap: '10px',
                color: 'var(--color-warning)',
                fontSize: '0.85rem'
              }}
            >
              <ShieldAlert size={20} style={{ flexShrink: 0 }} />
              <div>
                <strong>First Time Setup Required</strong>
                <p style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
                  No accounts found in the database. Set up your administrator credentials to proceed.
                </p>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="e.g. Administrator"
                  className="form-control"
                  style={{ paddingLeft: '45px' }}
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Admin Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  placeholder="admin@company.com"
                  className="form-control"
                  style={{ paddingLeft: '45px' }}
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <KeyRound size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="form-control"
                  style={{ paddingLeft: '45px' }}
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
              {loading ? 'Setting up system...' : 'Create Admin & Log In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  placeholder="name@company.com"
                  className="form-control"
                  style={{ paddingLeft: '45px' }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <KeyRound size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="form-control"
                  style={{ paddingLeft: '45px' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
          <a href="/register-visit" style={{ fontSize: '0.9rem', color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
            Are you a Visitor? Pre-Register here →
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
