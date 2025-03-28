import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../styles/AdvancedCursor.module.css';

// Default colors as fallbacks in case CSS variables aren't available
const DEFAULT_COLORS = {
  cursor: {
    default: '#f8fafc',    // white
    typing: '#6c8bff',     // blue
    error: '#ef4444',      // red
    success: '#10b981'     // green
  },
  glow: {
    default: 'rgba(255, 255, 255, 0.5)',
    typing: 'rgba(108, 139, 255, 0.5)',
    error: 'rgba(239, 68, 68, 0.5)',
    success: 'rgba(16, 185, 129, 0.5)'
  }
};

const AdvancedCursor = ({ 
  isActive = true, 
  isFocused = true, 
  status = 'default', // 'default', 'typing', 'error', 'success'
  position = { x: 0, y: 0 },
  scale = 1,
  emitParticle = false
}) => {
  // Safeguard against invalid props
  const safePosition = position || { x: 0, y: 0 };
  const safeStatus = ['default', 'typing', 'error', 'success'].includes(status) ? status : 'default';
  const safeScale = typeof scale === 'number' && !isNaN(scale) ? scale : 1;
  
  const [particles, setParticles] = useState([]);
  const [isVisible, setIsVisible] = useState(true);
  const [error, setError] = useState(null);
  
  // Handle cursor blinking
  useEffect(() => {
    if (!isActive) {
      setIsVisible(true);
      return;
    }
    
    // Only blink when not typing
    if (safeStatus !== 'typing') {
      const blinkInterval = setInterval(() => {
        setIsVisible(prev => !prev);
      }, 530);
      
      return () => clearInterval(blinkInterval);
    } else {
      setIsVisible(true);
    }
  }, [isActive, safeStatus]);
  
  // DISABLED: Particle emission was causing crashes
  // Instead of removing it completely, we just make it a no-op
  useEffect(() => {
    // This is intentionally empty to prevent particle emission
    // Previously this would emit particles, but it was causing the app to crash
    return () => {}; // Clean up function that does nothing
  }, [emitParticle, safeStatus]);
  
  // Cursor animation variants
  const cursorVariants = {
    default: {
      height: 18 * safeScale,
      width: 2 * safeScale,
      opacity: isVisible ? 1 : 0,
      transition: { duration: 0.1 }
    },
    typing: {
      height: 18 * safeScale,
      width: 4 * safeScale,
      opacity: 1,
      transition: { duration: 0.1 }
    },
    error: {
      height: 18 * safeScale,
      width: 4 * safeScale,
      opacity: 1,
      scaleY: [1, 1.2, 1],
      transition: { 
        scaleY: {
          repeat: 2,
          duration: 0.2
        }
      }
    },
    success: {
      height: 18 * safeScale,
      width: 4 * safeScale,
      opacity: 1,
      scaleY: [1, 0.8, 1],
      transition: { 
        scaleY: {
          duration: 0.3
        }
      }
    }
  };
  
  // Glow variants
  const glowVariants = {
    default: {
      opacity: 0.3,
      scale: 1
    },
    typing: {
      opacity: 0.6,
      scale: 1.2,
      transition: { duration: 0.2 }
    },
    error: {
      opacity: 0.8,
      scale: 1.5,
      transition: { duration: 0.2 }
    },
    success: {
      opacity: 0.6,
      scale: 1.2,
      transition: { duration: 0.2 }
    }
  };
  
  // Particle animation variants
  const particleVariants = {
    initial: {
      opacity: 0.8,
      scale: 0
    },
    animate: {
      opacity: 0,
      scale: 1,
      y: ({ y }) => y,
      x: ({ x }) => x,
      rotate: ({ rotation }) => rotation,
      transition: {
        duration: 0.7,
        ease: "easeOut"
      }
    }
  };
  
  // Get cursor color based on status
  const getCursorColor = () => {
    return DEFAULT_COLORS.cursor[safeStatus] || DEFAULT_COLORS.cursor.default;
  };
  
  // Get cursor glow color
  const getGlowColor = () => {
    return DEFAULT_COLORS.glow[safeStatus] || DEFAULT_COLORS.glow.default;
  };
  
  // If there was an error rendering, return a simple fallback cursor
  if (error) {
    return (
      <div 
        style={{ 
          position: 'absolute',
          left: safePosition.x,
          top: safePosition.y,
          width: '2px',
          height: '18px',
          backgroundColor: '#ffffff',
          borderRadius: '1px',
          pointerEvents: 'none'
        }}
      />
    );
  }
  
  // Safe render with error boundary
  try {
    return (
      <div 
        className={styles.cursorContainer}
        style={{ 
          transform: `translate(${safePosition.x}px, ${safePosition.y}px)`,
          opacity: isFocused ? 1 : 0.5,
          pointerEvents: 'none'
        }}
      >
        {/* DISABLED: Particles removed to prevent crashes 
        <AnimatePresence>
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className={styles.particle}
              style={{
                backgroundColor: getCursorColor()
              }}
              custom={particle}
              variants={particleVariants}
              initial="initial"
              animate="animate"
              exit={{ opacity: 0 }}
            />
          ))}
        </AnimatePresence>
        */}
        
        {/* Cursor glow */}
        <motion.div
          className={styles.cursorGlow}
          style={{ 
            backgroundColor: getGlowColor(),
          }}
          variants={glowVariants}
          animate={safeStatus}
        />
        
        {/* Main cursor */}
        <motion.div 
          className={styles.cursor}
          style={{ 
            backgroundColor: getCursorColor(),
          }}
          variants={cursorVariants}
          animate={safeStatus}
          initial="default"
        />
      </div>
    );
  } catch (error) {
    console.error("Error rendering cursor:", error);
    
    // Fallback cursor rendering without motion
    return (
      <div 
        style={{ 
          position: 'absolute',
          left: safePosition.x,
          top: safePosition.y,
          width: '2px',
          height: '18px',
          backgroundColor: '#ffffff',
          borderRadius: '1px',
          pointerEvents: 'none'
        }}
      />
    );
  }
};

export default AdvancedCursor; 