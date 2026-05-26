import React from 'react';
import type { Medication } from '../../types/patient';
import styles from './InfoCard.module.css';

interface Props { medications: Medication[]; }

const MedicationsCard: React.FC<Props> = ({ medications }) => (
  <div className={styles.card}>
    <div className={styles.label}>Current medications</div>
    <div className={styles.divider} />
    {medications.map((med) => (
      <div key={med.name}>
        <div className={styles.row}>
          <div className={styles.medName}>{med.name}</div>
          <span className={`${styles.badge} ${styles.badgeActive}`}>{med.status}</span>
        </div>
        <div className={styles.subtext}>Updated {med.updatedDaysAgo} days ago</div>
      </div>
    ))}
  </div>
);

export default MedicationsCard;