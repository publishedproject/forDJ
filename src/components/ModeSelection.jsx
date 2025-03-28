import React, { useState } from 'react';
import { motion } from 'framer-motion';
import styles from '../styles/ModeSelection.module.css';

const ModeSelection = ({ onSelectMode }) => {
  const [hoveredMode, setHoveredMode] = useState(null);
  const [selectedMode, setSelectedMode] = useState(null);
  
  // Define the typing modes with rich descriptions
  const modes = [
    {
      id: 'standard',
      name: 'Standard',
      description: 'Type the text exactly as it appears',
      icon: '📝',
      color: '#6c8bff'
    },
    {
      id: 'reverse',
      name: 'Reverse',
      description: 'Text is reversed, but type it normally',
      icon: '🔄',
      color: '#8a63d2'
    },
    {
      id: 'jumbled',
      name: 'Jumbled',
      description: 'Letters in each word are scrambled',
      icon: '🔀',
      color: '#ef4444'
    }
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.98 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        type: "spring", 
        damping: 25, 
        stiffness: 300,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    },
    exit: { 
      opacity: 0, 
      y: -20, 
      scale: 0.98,
      transition: { duration: 0.3 } 
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        damping: 20, 
        stiffness: 300 
      }
    }
  };
  
  // Card hover animations
  const cardVariants = {
    rest: { 
      scale: 1,
      boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.1)",
      transition: { duration: 0.2, ease: "easeInOut" }
    },
    hover: { 
      scale: 1.03,
      boxShadow: "0px 10px 25px rgba(0, 0, 0, 0.2)",
      transition: { duration: 0.2, ease: "easeInOut" }
    }
  };
  
  // Icon animations
  const iconVariants = {
    rest: { scale: 1, rotate: 0 },
    hover: { 
      scale: 1.2, 
      rotate: id => id === 'reverse' ? 180 : 0,
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 10
      }
    }
  };

  // Handle mode selection with proper event handling and debouncing
  const handleSelectMode = (mode, event) => {
    // Prevent event bubbling
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    // Debounce selection and provide visual feedback
    if (selectedMode === mode) return;
    
    setSelectedMode(mode);
    
    // Call the onSelectMode prop if it exists
    if (onSelectMode) {
      console.log(`Selecting mode: ${mode}`);
      
      // Short delay to allow animation to show
      setTimeout(() => {
        try {
          onSelectMode(mode);
        } catch (error) {
          console.error("Error selecting mode:", error);
        }
      }, 300);
    }
  };

  return (
    <motion.div 
      className={styles.container}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.h2 
        className={styles.title}
        variants={itemVariants}
      >
        Select Typing Mode
      </motion.h2>
      
      <motion.p 
        className={styles.subtitle}
        variants={itemVariants}
      >
        Choose a challenge that matches your skill level
      </motion.p>
      
      <div className={styles.modesGrid}>
        {modes.map((mode) => (
          <motion.div
            key={mode.id}
            className={`${styles.modeCard} ${selectedMode === mode.id ? styles.selected : ''}`}
            onClick={(e) => handleSelectMode(mode.id, e)}
            onMouseEnter={() => setHoveredMode(mode.id)}
            onMouseLeave={() => setHoveredMode(null)}
            data-mode={mode.id}
            variants={itemVariants}
            whileHover="hover"
            initial="rest"
            animate="rest"
            style={{
              borderColor: `${mode.color}30`,
              cursor: 'pointer',
              backgroundColor: `${mode.color}10`
            }}
          >
            <motion.div 
              className={styles.modeIcon} 
              style={{ backgroundColor: `${mode.color}15` }}
              variants={iconVariants}
              custom={mode.id}
            >
              <span>{mode.icon}</span>
            </motion.div>
            
            <motion.div 
              className={styles.modeGlow}
              style={{ 
                backgroundColor: mode.color,
                opacity: hoveredMode === mode.id || selectedMode === mode.id ? 0.2 : 0.1 
              }}
              variants={cardVariants}
            />
            
            <h3 className={styles.modeName}>{mode.name}</h3>
            <p className={styles.modeDescription}>{mode.description}</p>
            
            {/* Explicit button for better accessibility and mobile support */}
            <button 
              className={styles.selectButton}
              onClick={(e) => handleSelectMode(mode.id, e)}
              aria-label={`Select ${mode.name} mode`}
            >
              Select {mode.name}
            </button>
          </motion.div>
        ))}
      </div>
      
      <motion.div 
        className={styles.instructions}
        variants={itemVariants}
      >
        <h3 className={styles.instructionsTitle}>How to play</h3>
        <ol className={styles.instructionsList}>
          <li>Select a typing mode that challenges you</li>
          <li>Type the text shown in the display area</li>
          <li>Your WPM and accuracy will be calculated automatically</li>
          <li>Try to improve your speed and accuracy with each test</li>
        </ol>
      </motion.div>
    </motion.div>
  );
};

export default ModeSelection; 