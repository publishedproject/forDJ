import React from 'react';
import { motion } from 'framer-motion';
import styles from '../styles/TimerDisplay.module.css';

const TimerDisplay = ({ currentTime, totalTime }) => {
  const progress = (currentTime / totalTime) * 100;
  const timeLeft = Math.max(0, totalTime - currentTime);

  return (
    <div className={styles.timerContainer}>
      <motion.div 
        className={styles.timerBar}
        initial={{ width: "0%" }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.1 }}
      />
      <div className={styles.timerText}>
        {timeLeft.toFixed(1)}s
      </div>
    </div>
  );
};

export default TimerDisplay; 