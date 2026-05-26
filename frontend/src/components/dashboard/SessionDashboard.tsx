import React, { useState } from 'react';
import { usePatient } from '../../hooks/usePatient';
import PatientHeader from './PatientHeader';
import AISummaryCard from './AISummaryCard';
import MoodTrendCard from './MoodTrendCard';
import MedicationsCard from './MedicationsCard';
import LastSessionCard from './LastSessionCard';
import FlagsCard from './FlagsCard';
import styles from './SessionDashboard.module.css';

const PATIENTS = [
  { id: 'sarah-kim',    name: 'Sarah Kim',    initials: 'SK', program: 'Ketamine Therapy'     },
  { id: 'james-okafor', name: 'James Okafor', initials: 'JO', program: 'Holistic Psychiatry'  },
  { id: 'maya-patel',   name: 'Maya Patel',   initials: 'MP', program: 'Ketamine Therapy'     },
  { id: 'derek-santos', name: 'Derek Santos', initials: 'DS', program: 'Integration Coaching' },
  { id: 'lisa-chen',    name: 'Lisa Chen',    initials: 'LC', program: 'Holistic Psychiatry'  },
];

const SessionDashboard: React.FC = () => {
  const [selectedId, setSelectedId] = useState('sarah-kim');
  const { patient, loading, error, refetch } = usePatient(selectedId);

  return (
    <main className={styles.main}>

      {/* Patient selector tabs */}
      <div className={styles.tabs}>
        {PATIENTS.map((p) => (
          <button
            key={p.id}
            className={`${styles.tab} ${selectedId === p.id ? styles.tabActive : ''}`}
            onClick={() => setSelectedId(p.id)}
          >
            <div className={styles.tabAvatar}>{p.initials}</div>
            <div className={styles.tabInfo}>
              <div className={styles.tabName}>{p.name}</div>
              <div className={styles.tabProgram}>{p.program}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Dashboard content */}
      {loading ? (
        <div className={styles.state}>
          <span className={styles.stateText}>Loading patient data...</span>
        </div>
      ) : error || !patient ? (
        <div className={styles.state}>
          <span className={styles.stateText}>{error || 'Patient not found.'}</span>
          <button className={styles.retryBtn} onClick={refetch}>Retry</button>
        </div>
      ) : (
        <>
          <div className={styles.fadeUp} style={{ animationDelay: '0ms' }}>
            <PatientHeader patient={patient} />
          </div>
          <div className={`${styles.grid2} ${styles.fadeUp}`} style={{ animationDelay: '60ms' }}>
            <AISummaryCard summary={patient.aiSummary} />
            <MoodTrendCard trends={patient.moodTrends} />
          </div>
          <div className={`${styles.grid3} ${styles.fadeUp}`} style={{ animationDelay: '120ms' }}>
            <MedicationsCard medications={patient.medications} />
            <LastSessionCard session={patient.lastSession} />
            <FlagsCard flags={patient.flags} />
          </div>
        </>
      )}
    </main>
  );
};

export default SessionDashboard;