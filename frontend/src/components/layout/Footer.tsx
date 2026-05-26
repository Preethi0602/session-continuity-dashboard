import React from 'react';
import styles from './Footer.module.css';

const STACK = [
    'React + TypeScript',
    'Node.js + Express',
    'LangChain + RAG',
    'Anthropic Claude API',
    'JWT Auth',
  ];

const Footer: React.FC = () => (
  <footer className={styles.footer}>
    <div className={styles.stack}>
      {STACK.map((s) => <span key={s} className={styles.pill}>{s}</span>)}
    </div>
    <span className={styles.hipaa}>HIPAA Compliant</span>
  </footer>
);

export default Footer;