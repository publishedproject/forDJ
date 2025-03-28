import React from 'react';
import { motion } from 'framer-motion';
import styles from '../../styles/Button.module.css';

const Button = ({ children, onClick, variant = 'primary', className = '', ...props }) => {
  return (
    <motion.button
      className={`${styles.button} ${styles[variant]} ${className}`}
      onClick={onClick}
      whileHover={{ scale: 1.03, y: -2, boxShadow: "0 5px 15px rgba(0,0,0,0.1)" }}
      whileTap={{ scale: 0.98, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button; 