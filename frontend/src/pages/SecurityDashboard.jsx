import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import QRScanner from '../components/QRScanner';
import { QrCode, Search, UserCheck, ShieldAlert, ArrowLeftRight, Check, LogOut, DoorOpen, MapPin, History, RefreshCw } from 'lucide-react';

const SecurityDashboard = () => {
  const { apiUrl, token } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState(() => {
    if (window.location.pathname === '/security/logs') return 'logs';
    return 'scan';
  });
  const [gate, setGate] = useState('Main Gate');
  const [passCodeQuery, setPassCodeQuery] = useState('');


  const [loading, setLoading] = useState(false);
  const [passData, setPassData] = useState(null);
  const [isInside, setIsInside] = useState(false);
  const [passStatus, setPassStatus] = useState('');
  const [verificationError, setVerificationError] = useState('');


  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const response = await fetch(`${apiUrl}/logs?limit=15`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setLogs(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [activeTab]);

  const verifyPassCode = async (code) => {
    if (!code) return;
    setLoading(true);
    setVerificationError('');
    setPassData(null);

    try {
      const response = await fetch(`${apiUrl}/passes/verify/${code.trim()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setLoading(false);

      if (data.success) {
        setPassData(data.data);
        setIsInside(data.isInside);
        setPassStatus(data.status);
        showToast('Pass verified successfully', 'success');
      } else {
        setVerificationError(data.error || 'Invalid passcode');
        showToast(data.error || 'Invalid passcode', 'error');
      }
    } catch (err) {
      setLoading(false);
      setVerificationError('Network error verifying passcode');
      showToast('Connection error during verification', 'error');
    }
  };

  const handleManualSearch = (e) => {
    e.preventDefault();
    if (!passCodeQuery) return;
    verifyPassCode(passCodeQuery);
  };

  const handleScanSuccess = (decodedText) => {
    verifyPassCode(decodedText);
    setActiveTab('manual');
    setPassCodeQuery(decodedText);
  };

  const handleCheckIn = async () => {
    if (!passData) return;
    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/passes/check-in/${passData.passCode}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gate }),
      });
      const data = await response.json();
      setLoading(false);

      if (data.success) {
        showToast('Visitor Checked In Successfully!', 'success');

        verifyPassCode(passData.passCode);
        fetchLogs();
      } else {
        showToast(data.error || 'Failed to check in', 'error');
      }
    } catch (err) {
      setLoading(false);
      showToast('Network error during check in', 'error');
    }
  };

  const handleCheckOut = async () => {
    if (!passData) return;
    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/passes/check-out/${passData.passCode}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gate }),
      });
      const data = await response.json();
      setLoading(false);

      if (data.success) {
        showToast('Visitor Checked Out Successfully!', 'success');

        verifyPassCode(passData.passCode);
        fetchLogs();
      } else {
        showToast(data.error || 'Failed to check out', 'error');
      }
    } catch (err) {
      setLoading(false);
      showToast('Network error during check out', 'error');
    }
  };

  return (
    <div className="animate-fade-in">
      {}
      <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Gate Security Terminal</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Scan QR codes and register entries/exits.</p>
        </div>

        {}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} className="card" style={{ padding: '10px 20px' }}>
          <DoorOpen size={20} style={{ color: 'var(--color-primary)' }} />
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Gate:</span>
          <select value={gate} onChange={(e) => setGate(e.target.value)} className="form-control" style={{ width: '150px', padding: '6px 12px', fontSize: '0.85rem' }}>
            <option value="Main Gate">Main Gate</option>
            <option value="East Lobby">East Lobby</option>
            <option value="Building B Gate">Building B Gate</option>
            <option value="Service Entrance">Service Entrance</option>
          </select>
        </div>
      </div>

      {}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '30px', gap: '20px' }}>
        <button
          onClick={() => setActiveTab('scan')}
          className="btn"
          style={{
            background: 'transparent',
            border: 'none',
            color: activeTab === 'scan' ? 'var(--color-primary)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'scan' ? '2px solid var(--color-primary)' : '2px solid transparent',
            borderRadius: 0,
            padding: '12px 10px',
            fontWeight: 600
          }}
        >
          <QrCode size={16} /> Webcam Scanner
        </button>

        <button
          onClick={() => setActiveTab('manual')}
          className="btn"
          style={{
            background: 'transparent',
            border: 'none',
            color: activeTab === 'manual' ? 'var(--color-primary)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'manual' ? '2px solid var(--color-primary)' : '2px solid transparent',
            borderRadius: 0,
            padding: '12px 10px',
            fontWeight: 600
          }}
        >
          <Search size={16} /> Pass Verification & Actions
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
          <History size={16} /> Today's Gate Log ({logs.length})
        </button>
      </div>

      {}
      <div style={{ display: 'grid', gridTemplateColumns: activeTab !== 'logs' ? 'repeat(auto-fit, minmax(360px, 1fr))' : '1fr', gap: '30px' }}>

        {}
        {activeTab === 'scan' && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Webcam QR Code Reader</h3>
            <QRScanner onScanSuccess={handleScanSuccess} />
          </div>
        )}

        {activeTab === 'manual' && (
          <div className="card">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Search Pass Code</h3>

            <form onSubmit={handleManualSearch} style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
              <input
                type="text"
                placeholder="e.g. VP-20260624-9104"
                className="form-control"
                value={passCodeQuery}
                onChange={(e) => setPassCodeQuery(e.target.value)}
                disabled={loading}
              />
              <button type="submit" className="btn btn-primary" disabled={loading}>
                Verify
              </button>
            </form>

            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.01)', border: '1px dashed var(--border-color)', borderRadius: 'var(--border-radius-sm)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <strong>Search Tips:</strong> Enter the complete passcode printed on the digital visitor badge to pull up the visitor profile manually.
            </div>
          </div>
        )}

        {}
        {activeTab !== 'logs' && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {loading ? (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Processing verification request...</p>
            ) : verificationError ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '50%', color: 'var(--color-danger)', marginBottom: '15px' }}>
                  <ShieldAlert size={32} />
                </div>
                <h3 style={{ color: 'var(--color-danger)' }}>Verification Failed</h3>
                <p style={{ color: 'var(--text-secondary)', marginTop: '6px' }}>{verificationError}</p>
              </div>
            ) : passData ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {}
                <div
                  style={{
                    background: passStatus === 'active' ? 'var(--color-success-glow)' : 'var(--color-danger-glow)',
                    border: `1px solid ${passStatus === 'active' ? 'var(--color-success)' : 'var(--color-danger)'}`,
                    borderRadius: 'var(--border-radius-sm)',
                    padding: '12px 16px',
                    textAlign: 'center',
                    fontWeight: 700,
                    fontSize: '1rem',
                    color: passStatus === 'active' ? 'var(--color-success)' : 'var(--color-danger)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}
                >
                  {passStatus === 'active' ? '✓ Pass is Valid' : `✗ Pass is ${passStatus}`}
                </div>

                {}
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                  {passData.appointment.visitor.photo ? (
                    <img
                      src={passData.appointment.visitor.photo}
                      alt={passData.appointment.visitor.name}
                      style={{ width: '90px', height: '90px', borderRadius: 'var(--border-radius-sm)', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                    />
                  ) : (
                    <div style={{ width: '90px', height: '90px', borderRadius: 'var(--border-radius-sm)', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border-color)' }}>
                      <User size={36} />
                    </div>
                  )}
                  <div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>{passData.appointment.visitor.name}</h2>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      Company: <strong>{passData.appointment.visitor.company || 'N/A'}</strong>
                    </p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      ID Details: {passData.appointment.visitor.idType !== 'None' ? `${passData.appointment.visitor.idType} - ${passData.appointment.visitor.idNumber}` : 'No ID uploaded'}
                    </p>
                  </div>
                </div>

                {}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', background: 'rgba(0,0,0,0.15)', padding: '16px', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Host Personnel</span>
                    <p style={{ fontWeight: 600, color: '#fff', marginTop: '2px' }}>{passData.appointment.host.name}</p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{passData.appointment.host.department}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Scheduled Time</span>
                    <p style={{ fontWeight: 600, color: '#fff', marginTop: '2px' }}>{new Date(passData.appointment.scheduledTime).toLocaleString()}</p>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Valid Until</span>
                    <p style={{ fontWeight: 600, color: 'var(--color-danger)', marginTop: '2px' }}>{new Date(passData.validUntil).toLocaleString()}</p>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Visitor Status</span>
                    <p style={{ fontWeight: 700, color: isInside ? 'var(--color-success)' : 'var(--color-warning)', marginTop: '2px' }}>
                      {isInside ? 'Currently Inside' : 'Not Checked In'}
                    </p>
                  </div>
                </div>

                {}
                {passStatus === 'active' && (
                  <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                    {!isInside ? (
                      <button onClick={handleCheckIn} className="btn btn-success" style={{ flex: 1, padding: '12px' }}>
                        <Check size={18} /> Log Check-In Entry
                      </button>
                    ) : (
                      <button onClick={handleCheckOut} className="btn btn-danger" style={{ flex: 1, padding: '12px' }}>
                        <LogOut size={18} /> Log Check-Out Exit
                      </button>
                    )}
                  </div>
                )}

              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                <UserCheck size={36} style={{ color: 'var(--color-primary)', marginBottom: '10px', display: 'inline-block' }} />
                <h3>No Pass Loaded</h3>
                <p style={{ fontSize: '0.9rem', marginTop: '4px' }}>Scan a QR code or search code to trigger check-ins.</p>
              </div>
            )}
          </div>
        )}

        {}
        {activeTab === 'logs' && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.2rem' }}>Gate Check Log Stream</h3>
              <button onClick={fetchLogs} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} disabled={loadingLogs}>
                <RefreshCw size={12} /> Refresh Stream
              </button>
            </div>

            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Pass Code</th>
                    <th>Visitor Name</th>
                    <th>Company</th>
                    <th>Gate/Lobby</th>
                    <th>Action</th>
                    <th>Verified By</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingLogs ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>Loading logs...</td>
                    </tr>
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                        No check logs recorded today.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log._id}>
                        <td>{new Date(log.timestamp).toLocaleTimeString()}</td>
                        <td style={{ fontWeight: 600 }}>{log.pass?.passCode || 'N/A'}</td>
                        <td>{log.pass?.appointment?.visitor?.name || 'N/A'}</td>
                        <td>{log.pass?.appointment?.visitor?.company || 'N/A'}</td>
                        <td>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.85rem' }}>
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
          </div>
        )}

      </div>
    </div>
  );
};

export default SecurityDashboard;
