import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Printer, Calendar, User, Building, Landmark, Mail, ArrowLeft, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';

const PassView = () => {
  const { passCode } = useParams();
  const { apiUrl } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [pass, setPass] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPassDetails = async () => {
      try {
        const response = await fetch(`${apiUrl}/passes/${passCode}`);
        const data = await response.json();
        if (data.success) {
          setPass(data.data);
        } else {
          showToast(data.error || 'Failed to load pass details', 'error');
        }
      } catch (err) {
        showToast('Connection error loading digital pass', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchPassDetails();
  }, [passCode, apiUrl]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading your digital visitor pass...</p>
      </div>
    );
  }

  if (!pass) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '15px', padding: '20px', background: 'var(--bg-primary)' }}>
        <h2 style={{ color: 'var(--color-danger)' }}>Pass Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>The visitor pass code might be incorrect or has been deleted.</p>
        <button onClick={() => navigate('/')} className="btn btn-secondary">Go to Home</button>
      </div>
    );
  }

  const { appointment } = pass;
  const { visitor, host } = appointment;
  const isExpired = new Date() > new Date(pass.validUntil);
  const passStatus = pass.status === 'revoked' ? 'revoked' : (isExpired ? 'expired' : 'active');

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px 20px',
        background: 'radial-gradient(circle at 50% 50%, var(--bg-secondary), var(--bg-primary))'
      }}
    >
      {}
      <div className="no-print" style={{ width: '100%', maxWidth: '440px', marginBottom: '20px' }}>
        <button onClick={() => navigate('/register-visit')} className="btn btn-secondary" style={{ padding: '8px 15px' }}>
          <ArrowLeft size={16} /> Visitor Portal
        </button>
      </div>

      {}
      <div
        className={`card print-badge`}
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '24px',
          background: 'var(--bg-secondary)',
          border: `2px solid ${passStatus === 'active' ? 'var(--color-success)' : 'var(--color-danger)'}`,
          boxShadow: 'var(--shadow-lg)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {}
        <div
          style={{
            position: 'absolute',
            top: '20px',
            right: '-35px',
            background: passStatus === 'active' ? 'var(--color-success)' : 'var(--color-danger)',
            color: '#fff',
            padding: '5px 40px',
            transform: 'rotate(45deg)',
            fontSize: '0.75rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
        >
          {passStatus}
        </div>

        {}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid var(--border-color)' }}>
          <Landmark style={{ color: 'var(--color-primary)' }} size={24} />
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>VISITOR BADGE</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
              {host.organization || 'Headquarters'}
            </span>
          </div>
        </div>

        {}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
          <div style={{ flexShrink: 0 }}>
            {visitor.photo ? (
              <img
                src={visitor.photo}
                alt={visitor.name}
                style={{
                  width: '110px',
                  height: '110px',
                  borderRadius: 'var(--border-radius-sm)',
                  objectFit: 'cover',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-tertiary)'
                }}
              />
            ) : (
              <div
                style={{
                  width: '110px',
                  height: '110px',
                  borderRadius: 'var(--border-radius-sm)',
                  background: 'var(--bg-tertiary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                  border: '1px dashed var(--border-color)'
                }}
              >
                <User size={36} />
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>{visitor.name}</h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Building size={14} /> {visitor.company || 'Private'}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Mail size={14} /> {visitor.email}
            </span>
          </div>
        </div>

        {}
        <div style={{ height: '1px', background: 'var(--border-color)', margin: '15px 0' }}></div>

        {}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Host Officer:</span>
            <span style={{ fontWeight: 600, color: '#fff' }}>{host.name} ({host.department})</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Purpose:</span>
            <span style={{ fontWeight: 600, color: '#fff' }}>{appointment.purpose}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Location/Gate:</span>
            <span style={{ fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={14} style={{ color: 'var(--color-primary)' }} /> {appointment.location}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Scheduled Time:</span>
            <span style={{ fontWeight: 600, color: '#fff' }}>{new Date(appointment.scheduledTime).toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Valid Until:</span>
            <span style={{ fontWeight: 600, color: 'var(--color-danger)' }}>{new Date(pass.validUntil).toLocaleString()}</span>
          </div>
        </div>

        {}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#fff', padding: '16px', borderRadius: 'var(--border-radius-md)', margin: '10px 0' }}>
          <img src={pass.qrCode} alt="Pass Code QR" style={{ width: '160px', height: '160px' }} />
          <span style={{ fontSize: '0.85rem', color: '#1e1b4b', fontWeight: 700, letterSpacing: '2px', marginTop: '8px' }}>
            {pass.passCode}
          </span>
        </div>

        {}
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '15px' }}>
          By scanned check-in, you agree to security regulations and visitor guidelines.
        </p>
      </div>

      {}
      <div className="no-print" style={{ marginTop: '24px', display: 'flex', gap: '15px', width: '100%', maxWidth: '440px' }}>
        <button onClick={handlePrint} className="btn btn-primary" style={{ flex: 1 }}>
          <Printer size={18} /> Print Badge / Save PDF
        </button>
      </div>

      {}
      <style>{`
        @media print {
          body {
            background: #fff !important;
            color: #000 !important;
          }
          .no-print {
            display: none !important;
          }
          .print-badge {
            border: 2px solid #000 !important;
            box-shadow: none !important;
            background: #fff !important;
            margin: 0 auto !important;
            top: 0 !important;
            left: 0 !important;
            transform: none !important;
          }
          .print-badge * {
            color: #000 !important;
          }
          .print-badge select, .print-badge button {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PassView;
