import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Users, FileText, UserPlus, Calendar, ShieldCheck, Clock, Download, Plus, Edit2, Trash2, Key, Search, RefreshCw, X, MapPin } from 'lucide-react';

const AdminDashboard = () => {
  const { apiUrl, token } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState(() => {
    if (window.location.pathname === '/admin/users') return 'accounts';
    if (window.location.pathname === '/admin/logs') return 'logs';
    return 'metrics';
  });
  const [stats, setStats] = useState({ todayAppointments: 0, pendingApprovals: 0, approvedVisits: 0, currentlyInside: 0 });
  const [loading, setLoading] = useState(true);


  const [accounts, setAccounts] = useState([]);
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);


  const [accName, setAccName] = useState('');
  const [accEmail, setAccEmail] = useState('');
  const [accPassword, setAccPassword] = useState('');
  const [accRole, setAccRole] = useState('host');
  const [accDept, setAccDept] = useState('General');
  const [accPhone, setAccPhone] = useState('');
  const [accStatus, setAccStatus] = useState('active');


  const [logs, setLogs] = useState([]);
  const [logSearch, setLogSearch] = useState('');
  const [logGate, setLogGate] = useState('');
  const [logAction, setLogAction] = useState('');
  const [logPage, setLogPage] = useState(1);
  const [logPages, setLogPages] = useState(1);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch(`${apiUrl}/logs/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAccounts = async () => {
    try {
      const response = await fetch(`${apiUrl}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setAccounts(data.data);
      }
    } catch (err) {
      showToast('Error loading system accounts', 'error');
    }
  };

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      let query = `?page=${logPage}&search=${logSearch}&gate=${logGate}&action=${logAction}`;
      const response = await fetch(`${apiUrl}/logs${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setLogs(data.data);
        setLogPages(data.pages);
      }
    } catch (err) {
      showToast('Error loading audit log data', 'error');
    } finally {
      setLoadingLogs(false);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([fetchDashboardStats(), fetchAccounts(), fetchLogs()]);
    setLoading(false);
  };

  useEffect(() => {
    fetchAllData();
  }, [apiUrl, token]);

  useEffect(() => {
    fetchLogs();
  }, [logPage, logGate, logAction]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setLogPage(1);
    fetchLogs();
  };

  const handleAccountSubmit = async (e) => {
    e.preventDefault();
    if (!accName || !accEmail || (!editingAccount && !accPassword)) {
      showToast('Please fill in Name, Email, and Password', 'error');
      return;
    }

    try {
      const url = editingAccount ? `${apiUrl}/users/${editingAccount._id}` : `${apiUrl}/users`;
      const method = editingAccount ? 'PUT' : 'POST';
      const body = {
        name: accName,
        email: accEmail,
        role: accRole,
        department: accDept,
        phone: accPhone,
        status: accStatus
      };

      if (accPassword) {
        body.password = accPassword;
      }

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      const data = await response.json();

      if (data.success) {
        showToast(editingAccount ? 'Account updated' : 'Account created successfully', 'success');
        resetAccountForm();
        fetchAccounts();
      } else {
        showToast(data.error || 'Operation failed', 'error');
      }
    } catch (err) {
      showToast('Connection error during submission', 'error');
    }
  };

  const startEditAccount = (acc) => {
    setEditingAccount(acc);
    setAccName(acc.name);
    setAccEmail(acc.email);
    setAccPassword('');
    setAccRole(acc.role);
    setAccDept(acc.department);
    setAccPhone(acc.phone || '');
    setAccStatus(acc.status || 'active');
    setShowAccountForm(true);
  };

  const handleDeleteAccount = async (id) => {
    if (!window.confirm('Are you sure you want to remove this account? This action cannot be undone.')) return;
    try {
      const response = await fetch(`${apiUrl}/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        showToast('Account removed successfully', 'success');
        fetchAccounts();
      } else {
        showToast(data.error || 'Failed to remove account', 'error');
      }
    } catch (err) {
      showToast('Connection error removing account', 'error');
    }
  };

  const resetAccountForm = () => {
    setEditingAccount(null);
    setAccName('');
    setAccEmail('');
    setAccPassword('');
    setAccRole('host');
    setAccDept('General');
    setAccPhone('');
    setAccStatus('active');
    setShowAccountForm(false);
  };

  const handleExportCSV = () => {

    const downloadUrl = `${apiUrl}/logs/export?token=${token}`;


    fetch(`${apiUrl}/logs/export`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'visitor_pass_audit_logs.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();
        showToast('Audit log CSV compiled and downloaded', 'success');
      })
      .catch(err => showToast('Failed to download CSV export', 'error'));
  };

  return (
    <div className="animate-fade-in">
      {}
      <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Admin Hub Console</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Configure user accounts and perform system audits.</p>
        </div>
        <button onClick={fetchAllData} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <RefreshCw size={14} /> Refresh Data
        </button>
      </div>

      {}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-info">
            <h4>Today's Appointments</h4>
            <p>{stats.todayAppointments}</p>
          </div>
          <div className="stat-icon">
            <Calendar size={24} />
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '3px solid var(--color-warning)' }}>
          <div className="stat-info">
            <h4>Pending Approvals</h4>
            <p>{stats.pendingApprovals}</p>
          </div>
          <div className="stat-icon" style={{ color: 'var(--color-warning)' }}>
            <Clock size={24} />
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '3px solid var(--color-success)' }}>
          <div className="stat-info">
            <h4>Inside Building</h4>
            <p>{stats.currentlyInside}</p>
          </div>
          <div className="stat-icon" style={{ color: 'var(--color-success)' }}>
            <ShieldCheck size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h4>Active Passes</h4>
            <p>{stats.approvedVisits}</p>
          </div>
          <div className="stat-icon" style={{ color: 'var(--color-secondary)' }}>
            <FileText size={24} />
          </div>
        </div>
      </div>

      {}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '30px', gap: '20px' }}>
        <button
          onClick={() => setActiveTab('metrics')}
          className="btn"
          style={{
            background: 'transparent',
            border: 'none',
            color: activeTab === 'metrics' ? 'var(--color-primary)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'metrics' ? '2px solid var(--color-primary)' : '2px solid transparent',
            borderRadius: 0,
            padding: '12px 10px',
            fontWeight: 600
          }}
        >
          Overview Statistics
        </button>

        <button
          onClick={() => setActiveTab('accounts')}
          className="btn"
          style={{
            background: 'transparent',
            border: 'none',
            color: activeTab === 'accounts' ? 'var(--color-primary)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'accounts' ? '2px solid var(--color-primary)' : '2px solid transparent',
            borderRadius: 0,
            padding: '12px 10px',
            fontWeight: 600
          }}
        >
          Staff Directory ({accounts.length})
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className="btn"
          style={{
            background: 'transparent',
            border: 'none',
            color: activeTab === 'logs' ? 'var(--color-primary)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'logs' ? '2px solid var(--color-primary)' : '2px solid transparent',
            borderRadius: 0,
            padding: '12px 10px',
            fontWeight: 600
          }}
        >
          Gate Activity Reports
        </button>
      </div>

      {}
      {loading ? (
        <p style={{ color: 'var(--text-secondary)' }}>Loading statistics...</p>
      ) : (
        <>
          {activeTab === 'metrics' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '30px' }}>
              <div className="card">
                <h3>System Information</h3>
                <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--border-color)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Registered Host Employees</span>
                    <strong style={{ color: '#fff' }}>{accounts.filter(a => a.role === 'host').length}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--border-color)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Gate Security Officers</span>
                    <strong style={{ color: '#fff' }}>{accounts.filter(a => a.role === 'security').length}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid var(--border-color)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Database Status</span>
                    <strong style={{ color: 'var(--color-success)' }}>Online (Connected)</strong>
                  </div>
                </div>
              </div>

              <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                <ShieldCheck size={48} style={{ color: 'var(--color-success)', marginBottom: '15px' }} />
                <h3>Security Clearance Enforced</h3>
                <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '0.9rem', maxWidth: '300px' }}>
                  All visitor passes require host checkoff and email verification before entry is permitted at security checkpoints.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'accounts' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

              {}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>Registered Staff Accounts</h3>
                {!showAccountForm && (
                  <button onClick={() => setShowAccountForm(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Plus size={16} /> Add Staff Account
                  </button>
                )}
              </div>

              {}
              {showAccountForm && (
                <div className="card" style={{ maxWidth: '640px', background: 'var(--bg-secondary)', border: '1px solid var(--color-primary-focus)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3>{editingAccount ? 'Edit Staff Account' : 'Create Staff Account'}</h3>
                    <button onClick={resetAccountForm} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                      <X size={20} />
                    </button>
                  </div>

                  <form onSubmit={handleAccountSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div className="form-group">
                        <label className="form-label">Full Name *</label>
                        <input
                          type="text"
                          className="form-control"
                          required
                          value={accName}
                          onChange={(e) => setAccName(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Email Address *</label>
                        <input
                          type="email"
                          className="form-control"
                          required
                          value={accEmail}
                          onChange={(e) => setAccEmail(e.target.value)}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div className="form-group">
                        <label className="form-label">Password {editingAccount ? '(leave blank to keep)' : '*'}</label>
                        <input
                          type="password"
                          className="form-control"
                          placeholder={editingAccount ? '••••••••' : ''}
                          value={accPassword}
                          onChange={(e) => setAccPassword(e.target.value)}
                          required={!editingAccount}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Phone Number</label>
                        <input
                          type="tel"
                          className="form-control"
                          placeholder="+1 (555) 000-0000"
                          value={accPhone}
                          onChange={(e) => setAccPhone(e.target.value)}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                      <div className="form-group">
                        <label className="form-label">System Role</label>
                        <select className="form-control" value={accRole} onChange={(e) => setAccRole(e.target.value)}>
                          <option value="host">Host Employee</option>
                          <option value="security">Security Staff</option>
                          <option value="admin">Administrator</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Department</label>
                        <input
                          type="text"
                          className="form-control"
                          value={accDept}
                          onChange={(e) => setAccDept(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Status</label>
                        <select className="form-control" value={accStatus} onChange={(e) => setAccStatus(e.target.value)}>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                      <button type="button" onClick={resetAccountForm} className="btn btn-secondary">
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary">
                        {editingAccount ? 'Save Changes' : 'Create Account'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {}
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Department</th>
                      <th>Phone</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                          No staff accounts found.
                        </td>
                      </tr>
                    ) : (
                      accounts.map((acc) => (
                        <tr key={acc._id}>
                          <td style={{ fontWeight: 600 }}>{acc.name}</td>
                          <td>{acc.email}</td>
                          <td>
                            <span style={{ textTransform: 'capitalize', fontWeight: 600 }} className="text-primary">
                              {acc.role}
                            </span>
                          </td>
                          <td>{acc.department}</td>
                          <td>{acc.phone || 'N/A'}</td>
                          <td>
                            <span className={`badge badge-${acc.status === 'active' ? 'approved' : 'rejected'}`}>
                              {acc.status}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '8px' }}>
                              <button onClick={() => startEditAccount(acc)} className="btn btn-secondary btn-icon" style={{ padding: '6px' }}>
                                <Edit2 size={14} />
                              </button>
                              <button onClick={() => handleDeleteAccount(acc._id)} className="btn btn-danger btn-icon" style={{ padding: '6px' }}>
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {}
              <div className="card" style={{ padding: '20px' }}>
                <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'flex-end' }}>

                  <div style={{ flex: 1, minWidth: '200px' }} className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ marginBottom: '6px' }}>Search Visitor Name</label>
                    <div style={{ position: 'relative' }}>
                      <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                      <input
                        type="text"
                        placeholder="Type name..."
                        className="form-control"
                        style={{ paddingLeft: '38px', paddingTop: '8px', paddingBottom: '8px' }}
                        value={logSearch}
                        onChange={(e) => setLogSearch(e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ width: '160px' }} className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ marginBottom: '6px' }}>Gate Location</label>
                    <select value={logGate} onChange={(e) => setLogGate(e.target.value)} className="form-control" style={{ paddingTop: '8px', paddingBottom: '8px' }}>
                      <option value="">All Gates</option>
                      <option value="Main Gate">Main Gate</option>
                      <option value="East Lobby">East Lobby</option>
                      <option value="Building B Gate">Building B Gate</option>
                      <option value="Service Entrance">Service Entrance</option>
                    </select>
                  </div>

                  <div style={{ width: '140px' }} className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ marginBottom: '6px' }}>Action</label>
                    <select value={logAction} onChange={(e) => setLogAction(e.target.value)} className="form-control" style={{ paddingTop: '8px', paddingBottom: '8px' }}>
                      <option value="">All Actions</option>
                      <option value="check_in">Check In</option>
                      <option value="check_out">Check Out</option>
                    </select>
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ padding: '8px 20px', height: '40px' }} disabled={loadingLogs}>
                    Apply
                  </button>

                  <button type="button" onClick={handleExportCSV} className="btn btn-success" style={{ padding: '8px 20px', height: '40px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Download size={16} /> Export CSV Report
                  </button>
                </form>
              </div>

              {}
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Pass Code</th>
                      <th>Visitor Name</th>
                      <th>Visitor Company</th>
                      <th>Host Employee</th>
                      <th>Gate Location</th>
                      <th>Action</th>
                      <th>Verified Officer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingLogs ? (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '24px' }}>Querying logs database...</td>
                      </tr>
                    ) : logs.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                          No audit logs found matching filters.
                        </td>
                      </tr>
                    ) : (
                      logs.map((log) => (
                        <tr key={log._id}>
                          <td>{new Date(log.timestamp).toLocaleString()}</td>
                          <td style={{ fontWeight: 600 }}>{log.pass?.passCode || 'N/A'}</td>
                          <td style={{ fontWeight: 600 }}>{log.pass?.appointment?.visitor?.name || 'N/A'}</td>
                          <td>{log.pass?.appointment?.visitor?.company || 'N/A'}</td>
                          <td>{log.pass?.appointment?.host?.name || 'N/A'}</td>
                          <td>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', fontSize: '0.85rem' }}>
                              <MapPin size={12} style={{ color: 'var(--color-primary)' }} /> {log.gate}
                            </span>
                          </td>
                          <td>
                            <span className={`badge badge-${log.action === 'check_in' ? 'approved' : 'completed'}`} style={{ fontSize: '0.7rem' }}>
                              {log.action === 'check_in' ? 'Check In' : 'Check Out'}
                            </span>
                          </td>
                          <td>{log.performedBy?.name || 'Security'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {}
              {logPages > 1 && (
                <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '10px' }}>
                  <button
                    onClick={() => setLogPage(prev => Math.max(prev - 1, 1))}
                    disabled={logPage === 1}
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                  >
                    Previous
                  </button>
                  <span style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Page {logPage} of {logPages}
                  </span>
                  <button
                    onClick={() => setLogPage(prev => Math.min(prev + 1, logPages))}
                    disabled={logPage === logPages}
                    className="btn btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
