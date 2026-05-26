import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ProfilePage.module.css';

interface CoordinatorProfile {
  name: string;
  role: string;
  email: string;
  initials: string;
}

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const saved = localStorage.getItem('coordinator');
  const initial: CoordinatorProfile = saved
    ? JSON.parse(saved)
    : { name: 'Preethi K', role: 'Care Coordinator', email: 'preethi@betterucare.com', initials: 'PK' };

  const [form, setForm] = useState(initial);
  const [saved2, setSaved2] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      initials: name === 'name'
        ? value.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
        : prev.initials,
    }));
    setSaved2(false);
  };

  const handleSave = () => {
    localStorage.setItem('coordinator', JSON.stringify(form));
    setSaved2(true);
    setTimeout(() => setSaved2(false), 2500);
  };

  return (
    <main className={styles.main}>
      <button className={styles.back} onClick={() => navigate(-1)}>← Back</button>

      <div className={styles.card}>
        <div className={styles.avatarWrap}>
          <div className={styles.avatar}>{form.initials}</div>
          <div>
            <div className={styles.avatarName}>{form.name}</div>
            <div className={styles.avatarRole}>{form.role}</div>
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Profile information</h2>

          <div className={styles.field}>
            <label className={styles.label}>Full name</label>
            <input
              className={styles.input}
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your full name"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Role</label>
            <input
              className={styles.input}
              name="role"
              value={form.role}
              onChange={handleChange}
              placeholder="Your role"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input
              className={styles.input}
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="your@email.com"
              type="email"
            />
          </div>
        </div>

        <div className={styles.footer}>
          {saved2 && <span className={styles.savedMsg}>✓ Changes saved</span>}
          <button className={styles.saveBtn} onClick={handleSave}>
            Save changes
          </button>
        </div>
      </div>
    </main>
  );
};

export default ProfilePage;