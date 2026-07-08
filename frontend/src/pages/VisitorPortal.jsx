import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import CameraCapture from '../components/CameraCapture';
import { User, Mail, Phone, Building2, UserCheck, Calendar, FileText, CheckCircle2, ClipboardCheck, ArrowRight, ShieldCheck, Upload, UserPlus } from 'lucide-react';

const VisitorPortal = () => {
  const { apiUrl } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();


  const [step, setStep] = useState(1);
  const [hosts, setHosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [appointmentId, setAppointmentId] = useState('');


  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [idType, setIdType] = useState('None');
  const [idNumber, setIdNumber] = useState('');
  const [photo, setPhoto] = useState('');
  const [hostId, setHostId] = useState('');
  const [purpose, setPurpose] = useState('Meeting');
  const [scheduledTime, setScheduledTime] = useState('');
  const [location, setLocation] = useState('Main Office');


  const [otp, setOtp] = useState('');


  useEffect(() => {
    const fetchHosts = async () => {
      try {
        const response = await fetch(`${apiUrl}/appointments/hosts`);
        const data = await response.json();
        if (data.success) {
          setHosts(data.data);
          if (data.data.length > 0) setHostId(data.data[0]._id);
        }
      } catch (err) {
        showToast('Error loading host directory', 'error');
      }
    };
    fetchHosts();
  }, [apiUrl]);


  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('Image size should be less than 2MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result);
        showToast('Photo uploaded successfully', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePreRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !phone || !hostId || !purpose || !scheduledTime) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/appointments/pre-register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          company,
          idType,
          idNumber,
          photo,
          hostId,
          purpose,
          scheduledTime,
          location,
        }),
      });
      const data = await response.json();
      setLoading(false);

      if (data.success) {
        setAppointmentId(data.appointmentId);
        showToast(data.message, 'success');
        setStep(2);
      } else {
        showToast(data.error || 'Registration failed', 'error');
      }
    } catch (err) {
      setLoading(false);
      showToast('Could not submit registration. Server offline.', 'error');
    }
  };

  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otp) {
      showToast('Please enter the 6-digit OTP', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/appointments/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId,
          otp,
        }),
      });
      const data = await response.json();
      setLoading(false);

      if (data.success) {
        showToast(data.message, 'success');
        setStep(3);
      } else {
        showToast(data.error || 'OTP verification failed', 'error');
      }
    } catch (err) {
      setLoading(false);
      showToast('Connection error during verification', 'error');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        background: 'radial-gradient(circle at 50% 50%, var(--bg-secondary), var(--bg-primary))'
      }}
    >
      <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '800px' }}>
        {}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 style={{ color: 'var(--color-primary)' }} />
            <h2 style={{ fontSize: '1.4rem' }}>Visitor Registration</h2>
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            <span style={{ fontWeight: 600, fontSize: '0.85rem', color: step >= 1 ? 'var(--color-primary)' : 'var(--text-muted)' }}>
              1. Info & Photo
            </span>
            <span style={{ color: 'var(--border-color)' }}>•</span>
            <span style={{ fontWeight: 600, fontSize: '0.85rem', color: step >= 2 ? 'var(--color-primary)' : 'var(--text-muted)' }}>
              2. Verify OTP
            </span>
            <span style={{ color: 'var(--border-color)' }}>•</span>
            <span style={{ fontWeight: 600, fontSize: '0.85rem', color: step >= 3 ? 'var(--color-primary)' : 'var(--text-muted)' }}>
              3. Confirmation
            </span>
          </div>
        </div>

        {step === 1 && (
          <form onSubmit={handlePreRegisterSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>

              {}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <h3 style={{ fontSize: '1.05rem', marginBottom: '15px', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ClipboardCheck size={18} /> Visitor Details
                </h3>

                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <div style={{ position: 'relative' }}>
                    <User size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      className="form-control"
                      style={{ paddingLeft: '45px' }}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
                    <input
                      type="email"
                      required
                      placeholder="john.doe@gmail.com"
                      className="form-control"
                      style={{ paddingLeft: '45px' }}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
                    <input
                      type="tel"
                      required
                      placeholder="+1 (555) 000-0000"
                      className="form-control"
                      style={{ paddingLeft: '45px' }}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Company / Organization</label>
                  <div style={{ position: 'relative' }}>
                    <Building2 size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      placeholder="e.g. Acme Corp"
                      className="form-control"
                      style={{ paddingLeft: '45px' }}
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div className="form-group">
                    <label className="form-label">Gov ID Type</label>
                    <select
                      className="form-control"
                      value={idType}
                      onChange={(e) => setIdType(e.target.value)}
                    >
                      <option value="None">None</option>
                      <option value="National ID">National ID</option>
                      <option value="Passport">Passport</option>
                      <option value="Driver License">Driver License</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Gov ID Number</label>
                    <input
                      type="text"
                      placeholder="ID value"
                      className="form-control"
                      value={idNumber}
                      onChange={(e) => setIdNumber(e.target.value)}
                      disabled={idType === 'None'}
                    />
                  </div>
                </div>
              </div>

              {}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>

                {}
                <h3 style={{ fontSize: '1.05rem', marginBottom: '15px', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <UserPlus size={18} /> Profile Photo
                </h3>

                <CameraCapture onPhotoCaptured={(photoData) => setPhoto(photoData)} initialPhoto={photo} />

                {}
                <div style={{ marginTop: '10px', textAlign: 'center', width: '100%', maxWidth: '480px' }}>
                  <label htmlFor="photo-file" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer', background: 'var(--bg-tertiary)', padding: '6px 12px', borderRadius: '6px', border: '1px dashed var(--border-color)' }}>
                    <Upload size={14} /> Or upload image file
                  </label>
                  <input
                    type="file"
                    id="photo-file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    style={{ display: 'none' }}
                  />
                </div>

                <h3 style={{ fontSize: '1.05rem', margin: '20px 0 15px 0', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <UserCheck size={18} /> Meeting Details
                </h3>

                <div className="form-group">
                  <label className="form-label">Select Host / Employee *</label>
                  <select
                    className="form-control"
                    value={hostId}
                    onChange={(e) => setHostId(e.target.value)}
                    required
                  >
                    {hosts.length === 0 && <option value="">Loading hosts...</option>}
                    {hosts.map((host) => (
                      <option key={host._id} value={host._id}>
                        {host.name} ({host.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div className="form-group">
                    <label className="form-label">Purpose *</label>
                    <select
                      className="form-control"
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      required
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
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Scheduled Date & Time *</label>
                  <div style={{ position: 'relative' }}>
                    <Calendar size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }} />
                    <input
                      type="datetime-local"
                      required
                      className="form-control"
                      style={{ paddingLeft: '45px' }}
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                    />
                  </div>
                </div>

              </div>

            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '30px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="btn btn-secondary"
              >
                Back to Login
              </button>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ padding: '12px 30px' }}
              >
                {loading ? 'Submitting...' : 'Register & Request OTP'} <ArrowRight size={16} />
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtpSubmit} style={{ maxWidth: '480px', margin: '0 auto', textAlign: 'center', padding: '20px 0' }}>
            <div style={{ display: 'inline-flex', padding: '16px', background: 'var(--bg-tertiary)', borderRadius: '50%', color: 'var(--color-primary)', marginBottom: '20px' }}>
              <ShieldCheck size={32} />
            </div>
            <h3>Verify Your Email Address</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: '10px 0 30px 0' }}>
              A 6-digit verification code was sent to <strong>{email}</strong>. Enter it below to submit your appointment request.
            </p>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <input
                type="text"
                maxLength="6"
                placeholder="Enter 6-digit OTP"
                required
                className="form-control"
                style={{ fontSize: '1.5rem', textAlign: 'center', letterSpacing: '8px', padding: '16px' }}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                disabled={loading}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }} disabled={loading}>
              {loading ? 'Verifying OTP...' : 'Verify OTP & Request Access'}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="btn btn-secondary"
              style={{ width: '100%', marginTop: '10px' }}
              disabled={loading}
            >
              Go Back & Edit Info
            </button>
          </form>
        )}

        {step === 3 && (
          <div style={{ maxWidth: '540px', margin: '0 auto', textAlign: 'center', padding: '30px 0' }}>
            <div style={{ display: 'inline-flex', padding: '20px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', color: 'var(--color-success)', marginBottom: '24px' }}>
              <CheckCircle2 size={48} />
            </div>
            <h2>Pre-Registration Submitted!</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', margin: '12px 0 30px 0', lineHeight: 1.6 }}>
              Your email is verified. An approval request has been sent to your host. Once they approve it, your digital pass containing your check-in QR code will be emailed directly to <strong>{email}</strong>.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => {

                  setName('');
                  setEmail('');
                  setPhone('');
                  setCompany('');
                  setPhoto('');
                  setOtp('');
                  setStep(1);
                }}
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                Register Another Visitor
              </button>
              <button onClick={() => navigate('/login')} className="btn btn-secondary" style={{ width: '100%' }}>
                Go to Staff Portal Login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VisitorPortal;
