import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styles from './Navbar.module.css';

interface Props {
    onLogout: () => void;
    user: { name: string; role: string; initials: string; };
  }

  const Navbar: React.FC<Props> = ({ onLogout, user }) => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);


  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const go = (path: string) => {
    setShowDropdown(false);
    navigate(path);
  };

  return (
    <nav className={styles.nav}>
      <div className={styles.logo}>
        Session <span className={styles.logoAccent}>Continuity</span>
      </div>

      <div className={styles.links}>
        <NavLink to="/dashboard"
          className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
          Dashboard
        </NavLink>
        <NavLink to="/sessions"
          className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
          Sessions
        </NavLink>
        <NavLink to="/patients"
          className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
          Patients
        </NavLink>
        <NavLink to="/reports"
          className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
          Reports
        </NavLink>
      </div>

      <div className={styles.profileWrap} ref={dropdownRef}>
        <button
          className={styles.profileBtn}
          onClick={() => setShowDropdown((p) => !p)}
        >
          <div className={styles.avatar}>{user.initials}</div>
          <div className={styles.profileInfo}>
            <span className={styles.profileName}>{user.name}</span>
            <span className={styles.profileRole}>{user.role}</span>
          </div>
          <span className={styles.chevron}>{showDropdown ? '▲' : '▼'}</span>
        </button>

        {showDropdown && (
          <div className={styles.dropdown}>
            <div className={styles.dropdownHeader}>
              <div className={styles.dropdownAvatar}>{user.initials}</div>
              <div>
                <div className={styles.dropdownName}>{user.name}</div>
                <div className={styles.dropdownRole}>{user.role}</div>
              </div>
            </div>
            <div className={styles.dropdownDivider} />
            <button className={styles.dropdownItem}
              onClick={() => go('/profile')}>
              Profile settings
            </button>
            <button className={styles.dropdownItem}
              onClick={() => go('/notifications')}>
              Notification preferences
            </button>
            <div className={styles.dropdownDivider} />
            <button
              className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`}
              onClick={() => { setShowDropdown(false); onLogout(); }}
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;