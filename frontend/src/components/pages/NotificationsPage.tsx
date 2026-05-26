import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './NotificationsPage.module.css';

interface Pref { id: string; label: string; description: string; enabled: boolean; }

const DEFAULTS: Pref[] = [
  { id: 'new_patient',    label: 'New patient assigned',      description: 'When a new patient is added to your caseload',         enabled: true  },
  { id: 'session_reminder', label: 'Session reminders',       description: '30 minutes before an upcoming session',               enabled: true  },
  { id: 'flag_raised',    label: 'Flag raised',               description: 'When a patient flag is marked as new or critical',     enabled: true  },
  { id: 'missed_checkin', label: 'Missed check-ins',          description: 'When a patient misses a scheduled check-in',          enabled: true  },
  { id: 'ai_summary',     label: 'AI summary ready',          description: 'When a new AI summary is generated before a session',  enabled: false },
  { id: 'weekly_report',  label: 'Weekly program report',     description: 'Every Monday with a summary of caseload progress',    enabled: false },
];

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const saved = localStorage.getItem('notif_prefs');
  const [prefs, setPrefs] = useState<Pref[]>(saved ? JSON.parse(saved) : DEFAULTS);
  const [savedMsg, setSavedMsg] = useState(false);

  const toggle = (id: string) => {
    setPrefs((prev) => prev.map((p) => p.id === id ? { ...p, enabled: !p.enabled } : p));
    setSavedMsg(false);
  };

  const handleSave = () => {
    localStorage.setItem('notif_prefs', JSON.stringify(prefs));
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2500);
  };

  return (
    <main className={styles.main}>
      <button className={styles.back} onClick={() => navigate(-1)}>← Back</button>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h1 className={styles.title}>Notification preferences</h1>
          <p className={styles.subtitle}>Choose what you want to be notified about</p>
        </div>

        <div className={styles.divider} />

        <div className={styles.list}>
          {prefs.map((pref) => (
            <div key={pref.id} className={styles.row}>
              <div className={styles.rowInfo}>
                <div className={styles.rowLabel}>{pref.label}</div>
                <div className={styles.rowDesc}>{pref.description}</div>
              </div>
              <button
                className={`${styles.toggle} ${pref.enabled ? styles.toggleOn : ''}`}
                onClick={() => toggle(pref.id)}
                aria-label={`Toggle ${pref.label}`}
              >
                <div className={styles.toggleThumb} />
              </button>
            </div>
          ))}
        </div>

        <div className={styles.footer}>
          {savedMsg && <span className={styles.savedMsg}>✓ Preferences saved</span>}
          <button className={styles.saveBtn} onClick={handleSave}>
            Save preferences
          </button>
        </div>
      </div>
    </main>
  );
};

export default NotificationsPage;