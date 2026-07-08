import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Check, X, User, Calendar, Plus, Clock, FileCheck, Landmark, CheckSquare, ClipboardList, Send, MapPin } from 'lucide-react';

const HostDashboard = () => {
  const { apiUrl, token } = useAuth();
  const { showToast } = useToast();

  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({ todayAppointments: 0, pendingApprovals: 0, approvedVisits: 0, currentlyInside: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(() => {
    if (window.location.pathname === '/host/invite') return 'invite';
    return 'pending';
  });


  const [invName, setInvName] = useState('');
  const [invEmail, setInvEmail] = useState('');
  const [invPhone, setInvPhone] = useState('');
  const [invCompany, setInvCompany] = useState('');
  const [invPurpose, setInvPurpose] = useState('Meeting');
  const [invTime, setInvTime] = useState('');
  const [invLocation, setInvLocation] = useState('Main Office');
  const [submittingInvite, setSubmittingInvite] = useState(false);


  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };


      const statsRes = await fetch(`${apiUrl}/logs/dashboard/stats`, { headers });
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.stats);
      }


      const appRes = await fetch(`${apiUrl}/appointments`, { headers });
      const appData = await appRes.json();
      if (appData.success) {
        setAppointments(appData.data);
      }
    } catch (err) {
      showToast('Error loading host console data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [apiUrl, token]);

  const handleApprove = async (id) => {
    try {
      const response = await fetch(`${apiUrl}/appointments/${id}/approve`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        showToast(data.message, 'success');
        fetchData();
      } else {
        showToast(data.error || 'Failed to approve request', 'error');
      }
    } catch (err) {
      showToast('Connection error during approval', 'error');
    }
  };

  const handleReject = async (id) => {
    try {
      const response = await fetch(`${apiUrl}/appointments/${id}/reject`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        showToast(data.message, 'success');
        fetchData();
      } else {
        showToast(data.error || 'Failed to reject request', 'error');
      }
    } catch (err) {
      showToast('Connection error during rejection', 'error');
    }
  };

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    if (!invName || !invEmail || !invPhone || !invTime) {
      showToast('Please fill in name, email, phone, and scheduled time', 'error');
      return;
    }

    setSubmittingInvite(true);
    try {
      const response = await fetch(`${apiUrl}/appointments/invite`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: invName,
          email: invEmail,
          phone: invPhone,
          company: invCompany,
          purpose: invPurpose,
          scheduledTime: invTime,
          location: invLocation,
        }),
      });
      const data = await response.json();
      setSubmittingInvite(false);

      if (data.success) {
        showToast('Invitation sent successfully!', 'success');

        setInvName('');
        setInvEmail('');
        setInvPhone('');
        setInvCompany('');
        setInvTime('');
        setActiveTab('all');
        fetchData();
      } else {
        showToast(data.error || 'Failed to create invitation', 'error');
      }
    } catch (err) {
      setSubmittingInvite(false);
      showToast('Connection error sending invitation', 'error');
    }
  };


  const pendingRequests = appointments.filter(app => app.status === 'pending');
  const activeRequests = appointments.filter(app => app.status !== 'pending');

  return (
    <div className="animate-fade-in">
      {}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Employee Host Console</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage visitor approvals and issue invitations.</p>
      </div>

      {}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-info">
            <h4>Today's Visits</h4>
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
            <CheckSquare size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h4>Approved Passes</h4>
            <p>{stats.approvedVisits}</p>
          </div>
          <div className="stat-icon" style={{ color: 'var(--color-secondary)' }}>
            <FileCheck size={24} />
          </div>
        </div>
      </div>

      {}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '30px', gap: '20px' }}>
        <button
          onClick={() => setActiveTab('pending')}
          className="btn"
          style={{
            background: 'transparent',
            border: 'none',
            color: activeTab === 'pending' ? 'var(--color-primary)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'pending' ? '2px solid var(--color-primary)' : '2px solid transparent',
            borderRadius: 0,
            padding: '12px 10px',
            fontWeight: 600
          }}
        >
          <Clock size={16} /> Pending Approvals ({pendingRequests.length})
        </button>

        <button
          onClick={() => setActiveTab('all')}
          className="btn"
          style={{
            background: 'transparent',
            border: 'none',
            color: activeTab === 'all' ? 'var(--color-primary)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'all' ? '2px solid var(--color-primary)' : '2px solid transparent',
            borderRadius: 0,
            padding: '12px 10px',
            fontWeight: 600
          }}
        >
          <ClipboardList size={16} /> All Visits History ({activeRequests.length})
        </button>

        <button
          onClick={() => setActiveTab('invite')}
          className="btn"
          style={{
            background: 'transparent',
            border: 'none',
            color: activeTab === 'invite' ? 'var(--color-primary)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'invite' ? '2px solid var(--color-primary)' : '2px solid transparent',
            borderRadius: 0,
            padding: '12px 10px',
            fontWeight: 600
          }}
        >
          <Plus size={16} /> Create Direct Invite
        </button>
      </div>

      {}
      {loading ? (
        <p style={{ color: 'var(--text-secondary)' }}>Loading data...</p>
      ) : (
        <>
          {activeTab === 'pending' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {pendingRequests.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '40px', borderStyle: 'dashed' }}>
                  <CheckSquare size={36} style={{ color: 'var(--color-success)', marginBottom: '10px' }} />
                  <h3>All Clear!</h3>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>There are no pending visitor requests awaiting your approval.</p>
                </div>
              ) : (
                pendingRequests.map((app) => (
                  <div key={app._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center', justifyContent: 'space-between' }}>
                      {}
                      <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        {app.visitor.photo ? (
                          <img
                            src={app.visitor.photo}
                            alt={app.visitor.name}
                            style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                          />
                        ) : (
                          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)' }}>
                            <User size={28} style={{ color: 'var(--text-muted)' }} />
                          </div>
                        )}
                        <div>
                          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{app.visitor.name}</h3>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            {app.visitor.company ? `Company: ${app.visitor.company}` : 'Private Visitor'}
                          </span>
                        </div>
                      </div>

                      {}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px' }}>
                        <div>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Purpose</span>
                          <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', marginTop: '2px' }}>{app.purpose}</p>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Scheduled Time</span>
                          <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', marginTop: '2px' }}>{new Date(app.scheduledTime).toLocaleString()}</p>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Gate / Location</span>
                          <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <MapPin size={12} style={{ color: 'var(--color-primary)' }} /> {app.location}
                          </p>
                        </div>
                      </div>

                      {}
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => handleApprove(app._id)} className="btn btn-success" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                          <Check size={16} /> Approve Pass
                        </button>
                        <button onClick={() => handleReject(app._id)} className="btn btn-danger" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                          <X size={16} /> Decline
                        </button>
                      </div>
                    </div>

                    {}
                    {app.visitor.idType !== 'None' && (
                      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 16px', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)', alignSelf: 'flex-start', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        <strong>Security Verification:</strong> {app.visitor.idType} - {app.visitor.idNumber}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'all' && (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Scheduled Date</th>
                    <th>Visitor Name</th>
                    <th>Company</th>
                    <th>Purpose</th>
                    <th>Location</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {activeRequests.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                        No visitor history found.
                      </td>
                    </tr>
                  ) : (
                    activeRequests.map((app) => (
                      <tr key={app._id}>
                        <td>{new Date(app.scheduledTime).toLocaleString()}</td>
                        <td style={{ fontWeight: 600 }}>{app.visitor.name}</td>
                        <td>{app.visitor.company || 'N/A'}</td>
                        <td>{app.purpose}</td>
                        <td>{app.location}</td>
                        <td>
                          <span className={`badge badge-${app.status}`}>
                            {app.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'invite' && (
            <div className="card" style={{ maxWidth: '640px', margin: '0 auto' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', color: 'var(--color-primary)' }}>Issue Pre-Approved Visitor Pass</h3>

              <form onSubmit={handleInviteSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="form-group">
                    <label className="form-label">Visitor Full Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="John Doe"
                      value={invName}
                      onChange={(e) => setInvName(e.target.value)}
                      required
                      disabled={submittingInvite}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Visitor Email *</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="john@example.com"
                      value={invEmail}
                      onChange={(e) => setInvEmail(e.target.value)}
                      required
                      disabled={submittingInvite}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="form-group">
                    <label className="form-label">Visitor Phone Number *</label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="+1 (555) 012-3456"
                      value={invPhone}
                      onChange={(e) => setInvPhone(e.target.value)}
                      required
                      disabled={submittingInvite}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Company / Affiliation</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Acme Corp"
                      value={invCompany}
                      onChange={(e) => setInvCompany(e.target.value)}
                      disabled={submittingInvite}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="form-group">
                    <label className="form-label">Purpose of Visit *</label>
                    <select
                      className="form-control"
                      value={invPurpose}
                      onChange={(e) => setInvPurpose(e.target.value)}
                      required
                      disabled={submittingInvite}
                    >
                      <option value="Meeting">Meeting</option>
                      <option value="Interview">Interview</option>
                      <option value="Delivery">Delivery</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Personal">Personal</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Location / Gate</label>
                    <input
                      type="text"
                      className="form-control"
                      value={invLocation}
                      onChange={(e) => setInvLocation(e.target.value)}
                      disabled={submittingInvite}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Scheduled Date & Time *</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    value={invTime}
                    onChange={(e) => setInvTime(e.target.value)}
                    required
                    disabled={submittingInvite}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '10px' }}
                  disabled={submittingInvite}
                >
                  {submittingInvite ? (
                    'Generating Pass & Sending Email...'
                  ) : (
                    <>
                      <Send size={16} /> Issue Pass & Send Invitation Link
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HostDashboard;
