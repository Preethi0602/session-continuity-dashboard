import React, { useState } from 'react';
import { authApi } from '../../api/patientApi';
import styles from './LoginPage.module.css';

interface Props { onLogin: (user: any) => void; }

const LoginPage: React.FC<Props> = ({ onLogin }) => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      const data = await authApi.login(email, password);
      onLogin(data.user);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          Session <span className={styles.logoAccent}>Continuity</span>
        </div>
        <p className={styles.tagline}>Care coordinator portal</p>

        <div className={styles.divider} />

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input
              className={styles.input}
              type="email"
              placeholder="your@betterucare.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <input
              className={styles.input}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button
            className={styles.submitBtn}
            type="submit"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className={styles.hint}>
          Demo: preethi@betterucare.com / demo123
        </div>
      </div>
    </div>
  );
};

export default LoginPage;