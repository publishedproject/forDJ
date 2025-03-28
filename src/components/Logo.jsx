import React from 'react';
import { motion } from 'framer-motion';
import styles from '../styles/Logo.module.css';

const Logo = ({ size = 'medium' }) => {
  const sizeClass = {
    small: styles.logoSmall,
    medium: styles.logoMedium,
    large: styles.logoLarge
  }[size] || styles.logoMedium;

  return (
    <motion.div 
      className={`${styles.logoContainer} ${sizeClass}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
    >
      <h1 className={styles.logoText}>
        <span className={styles.typist}>Typist</span>
        <span className={styles.flow}>Flow</span>
        <div className={styles.shimmerOverlay}></div>
      </h1>
    </motion.div>
  );
};

export default Logo; 