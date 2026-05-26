import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientApi } from '../../api/patientApi';
import type { PatientListItem } from '../../types/patient';
import styles from './DashboardPage.module.css';

const DashboardPage: React.FC = () => {
  const [patients, setPatients] = useState<PatientListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    patientApi.getAll().then((data) => {
      setPatients(data);
      setLoading(false);
    });
  }, []);

  const totalFlags   = patients.reduce((sum, p) => sum + p.flagCount, 0);
  const todaySessions = patients.filter((p) =>
    p.nextSession.toLowerCase().includes('today')
  ).length;

  return (
    <main className={styles.main}>

      {/* Welcome header */}
      <div className={styles.welcomeRow}>
        <div>
          <h1 className={styles.title}>Good afternoon, Preethi</h1>
          <p className={styles.subtitle}>Here is your caseload overview for today</p>
        </div>
        <div className={styles.dateChip}>
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long', month: 'long', day: 'numeric'
          })}
        </div>
      </div>

      {/* Stats row */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{patients.length}</div>
          <div className={styles.statLabel}>Active patients</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{todaySessions}</div>
          <div className={styles.statLabel}>Sessions today</div>
        </div>
        <div className={`${styles.statCard} ${totalFlags > 0 ? styles.statCardWarn : ''}`}>
          <div className={`${styles.statValue} ${totalFlags > 0 ? styles.statValueWarn : ''}`}>
            {totalFlags}
          </div>
          <div className={styles.statLabel}>Active flags</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>
            {patients.length > 0
              ? Math.round(patients.reduce((s, p) => s + (p.session.current / p.session.total) * 100, 0) / patients.length)
              : 0}%
          </div>
          <div className={styles.statLabel}>Avg program progress</div>
        </div>
      </div>

      {/* Today's sessions */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Today's sessions</h2>
          <button className={styles.viewAll} onClick={() => navigate('/sessions')}>
            View all →
          </button>
        </div>

        {loading ? (
          <div className={styles.loading}>Loading...</div>
        ) : (
          <div className={styles.sessionList}>
            {patients
              .filter((p) => p.nextSession.toLowerCase().includes('today'))
              .map((p) => (
                <div
                  key={p.id}
                  className={styles.sessionRow}
                  onClick={() => navigate('/sessions')}
                >
                  <div className={styles.sessionAvatar}>{p.initials}</div>
                  <div className={styles.sessionInfo}>
                    <div className={styles.sessionName}>{p.name}</div>
                    <div className={styles.sessionMeta}>{p.program} · Session {p.session.current} of {p.session.total}</div>
                  </div>
                  <div className={styles.sessionTime}>{p.nextSession}</div>
                  {p.flagCount > 0 && (
                    <div className={styles.sessionFlag}>
                      ⚠ {p.flagCount} flag{p.flagCount > 1 ? 's' : ''}
                    </div>
                  )}
                  <div className={styles.sessionArrow}>→</div>
                </div>
              ))}
            {patients.filter((p) => p.nextSession.toLowerCase().includes('today')).length === 0 && (
              <div className={styles.empty}>No sessions scheduled for today</div>
            )}
          </div>
        )}
      </div>

      {/* All patients overview */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>All patients</h2>
          <button className={styles.viewAll} onClick={() => navigate('/patients')}>
            View all →
          </button>
        </div>

        {loading ? (
          <div className={styles.loading}>Loading...</div>
        ) : (
          <div className={styles.patientGrid}>
            {patients.map((p) => (
              <div
                key={p.id}
                className={styles.patientCard}
                onClick={() => navigate('/sessions')}
              >
                <div className={styles.patientCardTop}>
                  <div className={styles.patientAvatar}>{p.initials}</div>
                  <div className={styles.patientInfo}>
                    <div className={styles.patientName}>{p.name}</div>
                    <div className={styles.patientProgram}>{p.program}</div>
                  </div>
                  {p.flagCount > 0 && (
                    <span className={styles.flagBadge}>
                      {p.flagCount} flag{p.flagCount > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                <div className={styles.progressWrap}>
                  <div className={styles.progressLabel}>
                    <span>Session {p.session.current} of {p.session.total}</span>
                    <span>{Math.round((p.session.current / p.session.total) * 100)}%</span>
                  </div>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${(p.session.current / p.session.total) * 100}%` }}
                    />
                  </div>
                </div>

                <div className={styles.patientNext}>
                  <span className={styles.nextLabel}>Next session</span>
                  <span className={styles.nextValue}>{p.nextSession}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </main>
  );
};

export default DashboardPage;
