import React, { useEffect, useState } from 'react';
import { patientApi } from '../../api/patientApi';
import type { PatientListItem } from '../../types/patient';
import styles from './Page.module.css';

const PatientsPage: React.FC = () => {
  const [patients, setPatients] = useState<PatientListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    patientApi.getAll().then((data) => {
      setPatients(data);
      setLoading(false);
    });
  }, []);

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1 className={styles.title}>Patients</h1>
        <p className={styles.subtitle}>All active patients in your program</p>
      </div>
      {loading ? (
        <div className={styles.loading}>Loading patients...</div>
      ) : (
        <div className={styles.grid}>
          {patients.map((p) => (
            <div key={p.id} className={styles.card}>
              <div className={styles.cardTop}>
                <div className={styles.avatar}>{p.initials}</div>
                <div>
                  <div className={styles.name}>{p.name}</div>
                  <div className={styles.meta}>{p.program}</div>
                </div>
                {p.flagCount > 0 && (
                  <span className={styles.flagCount}>
                    {p.flagCount} flag{p.flagCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <div className={styles.cardBottom}>
                <span className={styles.sessionInfo}>
                  Session {p.session.current} of {p.session.total}
                </span>
                <span className={styles.nextSession}>{p.nextSession}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default PatientsPage;