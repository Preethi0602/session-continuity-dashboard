import React from 'react';
import type { LastSession } from '../../types/patient';
import styles from './InfoCard.module.css';

interface Props { session: LastSession; }

const LastSessionCard: React.FC<Props> = ({ session }) => (
  <div className={styles.card}>
    <div className={styles.label}>Last session</div>
    <div className={styles.divider} />
    <div className={styles.subtext} style={{ marginBottom: 6 }}>{session.daysAgo} days ago</div>
    <div className={styles.rating}>
      <span className={styles.ratingNum}>{session.rating}</span>
      <span className={styles.ratingDenom}>/10</span>
    </div>
    <blockquote className={styles.quote}>"{session.note}"</blockquote>
  </div>
);

export default LastSessionCard;