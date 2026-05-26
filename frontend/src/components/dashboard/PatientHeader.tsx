import React from 'react';
import type { Patient } from '../../types/patient';
import styles from './PatientHeader.module.css';

interface Props { patient: Patient; }

const PatientHeader: React.FC<Props> = ({ patient }) => {
  const activeFlag = patient.flags[0];
  return (
    <div className={styles.header}>
      <div className={styles.info}>
        <div className={styles.avatar}>{patient.initials}</div>
        <div>
          <div className={styles.name}>{patient.name}</div>
          <div className={styles.meta}>
            <span>Session {patient.session.current} of {patient.session.total}</span>
            <span>{patient.nextSession}</span>
            <span>{patient.program}</span>
          </div>
        </div>
      </div>
      {activeFlag && (
        <div className={styles.flagBadge}>
          <div className={styles.flagDot} />
          {activeFlag.label}
        </div>
      )}
    </div>
  );
};

export default PatientHeader;