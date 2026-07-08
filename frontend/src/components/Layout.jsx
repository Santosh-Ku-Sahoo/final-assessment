import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  QrCode,
  FileText,
  UserPlus,
  LogOut,
  Building,
  Menu,
  X,
  UserCheck
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user) return <>{children}</>;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };


  const menuItems = {
    admin: [
      { text: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/admin' },
      { text: 'User Accounts', icon: <Users size={20} />, path: '/admin/users' },
      { text: 'Gate Activity Logs', icon: <FileText size={20} />, path: '/admin/logs' },
    ],
    host: [
      { text: 'Appointments Console', icon: <UserCheck size={20} />, path: '/host' },
      { text: 'Create Visitor Invite', icon: <UserPlus size={20} />, path: '/host/invite' },
    ],
    security: [
      { text: 'Scanner Checkpoint', icon: <QrCode size={20} />, path: '/security' },
      { text: 'Check Log History', icon: <FileText size={20} />, path: '/security/logs' },
    ]
  };

  const currentMenu = menuItems[user.role] || [];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {}
      <aside
        style={{
          width: '260px',
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 99,
          transition: 'all 0.3s'
        }}
        className="desktop-sidebar"
      >
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border-color)' }}>
          <Building className="text-primary" style={{ color: 'var(--color-primary)' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, background: 'linear-gradient(to right, #fff, var(--text-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            VisiPass Gate
          </h2>
        </div>

        <nav style={{ flex: 1, padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {currentMenu.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setMobileMenuOpen(false);
                }}
                className="btn"
                style={{
                  justifyContent: 'flex-start',
                  width: '100%',
                  background: isActive ? 'var(--color-primary)' : 'transparent',
                  color: isActive ? '#fff' : 'var(--text-secondary)',
                  border: 'none',
                  borderRadius: 'var(--border-radius-sm)',
                  padding: '12px 16px',
                  boxShadow: isActive ? 'var(--shadow-glow)' : 'none',
                }}
              >
                {item.icon}
                <span>{item.text}</span>
              </button>
            );
          })}
        </nav>

        {}
        <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
            <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff' }}>{user.name}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              {user.role} • {user.department || 'Staff'}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-secondary"
            style={{ width: '100%', padding: '8px 12px', fontSize: '0.85rem' }}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {}
      <div
        className="mobile-top-bar"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '60px',
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-color)',
          display: 'none',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          zIndex: 100
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Building style={{ color: 'var(--color-primary)' }} size={20} />
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>VisiPass</h2>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: '60px',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'var(--bg-primary)',
            zIndex: 99,
            display: 'flex',
            flexDirection: 'column',
            padding: '20px'
          }}
        >
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
            {currentMenu.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className="btn"
                  style={{
                    justifyContent: 'flex-start',
                    background: isActive ? 'var(--color-primary)' : 'var(--bg-secondary)',
                    color: '#fff',
                    border: 'none',
                    padding: '16px'
                  }}
                >
                  {item.icon}
                  <span>{item.text}</span>
                </button>
              );
            })}
          </nav>
          <div style={{ padding: '20px 0', borderTop: '1px solid var(--border-color)' }}>
            <p style={{ fontWeight: 600, color: '#fff' }}>{user.name}</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '15px' }}>{user.role}</p>
            <button onClick={handleLogout} className="btn btn-danger" style={{ width: '100%' }}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      )}

      {}
      <main
        style={{
          flex: 1,
          padding: '40px',
          marginLeft: '260px',
          minHeight: '100vh',
          transition: 'all 0.3s'
        }}
        className="main-layout-content"
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>{children}</div>
      </main>

      {}
      <style>{`
        @media (max-width: 768px) {
          .desktop-sidebar {
            display: none !important;
          }
          .mobile-top-bar {
            display: flex !important;
          }
          .main-layout-content {
            margin-left: 0 !important;
            padding: 80px 20px 40px 20px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Layout;
