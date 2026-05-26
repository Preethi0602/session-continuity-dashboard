import React from 'react';
import type { SessionFlag } from '../../types/patient';
import styles from './InfoCard.module.css';

interface Props { flags: SessionFlag[]; }

const FlagsCard: React.FC<Props> = ({ flags }) => (
  <div className={styles.card}>
    <div className={styles.label}>Flags</div>
    <div className={styles.divider} />
    {flags.map((flag) => (
      <div key={flag.id} className={styles.flagRow}>
        <span className={styles.flagText}>{flag.label}</span>
        {flag.isNew && <span className={styles.newBadge}>NEW</span>}
      </div>
    ))}
    <div className={styles.subtext} style={{ marginTop: 8 }}>No other flags this week</div>
  </div>
);

export default FlagsCard;