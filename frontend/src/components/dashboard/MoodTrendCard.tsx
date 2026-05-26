import React from 'react';
import type { MoodTrend } from '../../types/patient';
import styles from './MoodTrendCard.module.css';

interface Props { trends: MoodTrend[]; }

function moodColor(score: number, max: number): string {
  const pct = score / max;
  if (pct <= 0.35) return '#7ee8a2';
  if (pct <= 0.55) return '#fbbf24';
  return '#f87171';
}

function trendIcon(trend: MoodTrend['trend']): string {
  return trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';
}

function trendColor(label: string, trend: MoodTrend['trend']): string {
  const isPositive = label.toLowerCase().includes('wellbeing') ||
                     label.toLowerCase().includes('sleep');
  if (isPositive) return trend === 'up' ? '#7ee8a2' : trend === 'down' ? '#f87171' : '#6b7280';
  return trend === 'down' ? '#7ee8a2' : trend === 'up' ? '#f87171' : '#6b7280';
}

const MoodTrendCard: React.FC<Props> = ({ trends }) => (
  <div className={styles.card}>
    <div className={styles.label}>Mood trend — last 4 weeks</div>
    <div className={styles.divider} />
    {trends.map((m) => (
      <div key={m.label} className={styles.row}>
        <div className={styles.moodLabel}>{m.label}</div>
        <div className={styles.barWrap}>
          <div
            className={styles.barFill}
            style={{ width: `${(m.score / m.max) * 100}%`, background: moodColor(m.score, m.max) }}
          />
        </div>
        <div className={styles.score}>{m.score}/{m.max}</div>
        <div className={styles.trend} style={{ color: trendColor(m.label, m.trend) }}>
          {trendIcon(m.trend)}
        </div>
      </div>
    ))}
  </div>
);

export default MoodTrendCard;