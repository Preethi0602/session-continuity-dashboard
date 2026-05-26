import React from 'react';
import styles from './Page.module.css';

const metrics = [
  { label: 'Active patients',     value: '1',   sub: 'in current programs'  },
  { label: 'Sessions this month', value: '4',   sub: 'across all patients'  },
  { label: 'Avg session rating',  value: '7.0', sub: 'out of 10'            },
  { label: 'Flags raised',        value: '1',   sub: 'requiring attention'  },
];

const ReportsPage: React.FC = () => (
  <main className={styles.main}>
    <div className={styles.header}>
      <h1 className={styles.title}>Reports</h1>
      <p className={styles.subtitle}>Program outcomes and analytics overview</p>
    </div>
    <div className={styles.metricsGrid}>
      {metrics.map((m) => (
        <div key={m.label} className={styles.metricCard}>
          <div className={styles.metricValue}>{m.value}</div>
          <div className={styles.metricLabel}>{m.label}</div>
          <div className={styles.metricSub}>{m.sub}</div>
        </div>
      ))}
    </div>
    <div className={styles.card} style={{ marginTop: 24 }}>
      <div className={styles.comingSoon}>
        Detailed analytics and outcome tracking coming soon.
        <br />
        <span>This will connect to PostgreSQL and show real program data.</span>
      </div>
    </div>
  </main>
);

export default ReportsPage;