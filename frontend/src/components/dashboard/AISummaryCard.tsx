import React from 'react';
import type { AISummary } from '../../types/patient';
import styles from './AISummaryCard.module.css';

interface Props { summary: AISummary; }

const AISummaryCard: React.FC<Props> = ({ summary }) => (
  <div className={styles.card}>
    <div className={styles.label}>AI Summary</div>
    <div className={styles.divider} />
    <p className={styles.text}>{summary.text}</p>
    <div className={styles.focusLabel}>Suggested focus today</div>
    <div className={styles.tags}>
      {summary.suggestedFocus.map((f) => (
        <span key={f} className={styles.tag}>{f}</span>
      ))}
    </div>
    <div className={styles.generated}>
  <div className={styles.dot} />
  {summary.generatedBy === 'Anthropic Claude'
    ? `Anthropic Claude · generated ${summary.generatedMinutesAgo === 0
        ? 'just now'
        : `${summary.generatedMinutesAgo} min ago`}`
    : summary.generatedBy === 'fallback'
    ? 'AI unavailable · showing fallback'
    : `LangChain + RAG · generated ${summary.generatedMinutesAgo} min ago`}
</div>
  </div>
);

export default AISummaryCard;